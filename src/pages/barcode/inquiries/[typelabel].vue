<script setup>
import { requiredValidator } from "@/@core/utils/validators"
import axiosIns from "@/plugins/axios"
import { onMounted, ref, watchEffect } from "vue"
import { useToast } from "vue-toastification"
import { useRoute, useRouter } from "vue-router" // Import useRoute dan useRouter untuk menangani route dan parameter

const toast = useToast()
const route = useRoute() // Akses route untuk mendapatkan parameter
const router = useRouter() // Untuk navigasi programatik jika diperlukan

// Refs untuk form fields
const prodId = ref()
const prodDate = ref(new Date().toISOString().split("T")[0]) // Default ke tanggal hari ini
const typelabel = ref(null) // Definisikan typelabel sebagai reactive ref
const nametype = ref("") // Nama tipe label yang akan ditampilkan
const shiftOptions = ref([])
const unitOptions = ref([])
const machineOptions = ref([])
const nextStickerNumber = ref(1)
const fromPage = ref(1)
const toPage = ref(1)
const totalPage = ref(1)
const pengawas = ref("")
const operator = ref("")
const code_container = ref("")
const showQrCode = ref(true)
const showMachineNumber = ref(true)
const showCodeContainer = ref(true)
const refForm = ref()
const ivsMachine = ref("")
const showMachineSelect = ref(false)
const showRebbeca = ref(false)
const shift = ref() // Inisialisasi shift
const unit = ref() // Inisialisasi unit
const machine = ref() // Inisialisasi mesin

// Fungsi untuk mengambil data shift
const fetchShift = async () => {
  try {
    const res = await axiosIns.get("/shift")

    shiftOptions.value = res.data.data
  } catch (error) {
    console.log(error)
  }
}

// Fungsi untuk mengambil data berdasarkan typelabel
const fetchTypeLabel = async () => {
  try {
    const res = await axiosIns.get(`/typelabel/${route.params.typelabel}`)

    typelabel.value = res.data.data[0].id
    nametype.value = res.data.data[0].name || 'Unknown'
    if (typelabel.value=='11' || typelabel.value=='12') {
      showRebbeca.value = true
    } else {
      showRebbeca.value = false // Sembunyikan select mesin jika ivs_machine tidak kosong
    }
  } catch (error) {
    console.log(error)
    toast.error("Error fetching typelabel data")
  }
}

// Fungsi untuk mengambil data unit
const fetchUnit = async () => {
  try {
    const res = await axiosIns.get("/units")

    unitOptions.value = res.data.data
  } catch (error) {
    console.log(error)
  }
}

// Fungsi untuk mengambil data mesin
const fetchMachine = async () => {
  try {
    const res = await axiosIns.get("/barcodes/get-machine")

    machineOptions.value = res.data.data
  } catch (error) {
    console.log(error)
  }
}

// Fungsi untuk mengambil data produk berdasarkan prodId
const fetchProdData = async () => {
  if (!prodId.value) {
    return // Pastikan prodId tersedia
  }

  try {
    console.log(`Fetching product data for: ${prodId.value}`)

    const response = await axiosIns.get(`/barcodes/get-product?boNumber=${prodId.value}`)

    // Log the response data to inspect its structure
    console.log("Product Data Response:", response.data)

    // Check if response.data exists and has the expected structure
    ivsMachine.value = response.data.data[0].IVS_MESIN || "" // Ambil nilai ivs_machine dari response data
    console.log("IVS_MESIN:", ivsMachine.value) // Cek apakah nilai ivs_machine benar

    // Jika ivsMachine kosong, tampilkan select mesin
    if (!ivsMachine.value) {
      showMachineSelect.value = true
      fetchMachine() // Ambil data mesin
    } else {
      showMachineSelect.value = false // Sembunyikan select mesin jika ivs_machine tidak kosong
    }
  } catch (error) {
    console.error("Error fetching product data:", error)
    toast.error("Terjadi kesalahan dalam mengambil data produk!")
  }
}

// Fungsi untuk mengambil nomor sticker berikutnya
const fetchNextStickerNumber = async () => {
  if (prodId.value) {
    try {
      const response = await axiosIns.get(`/barcodes/getlast?boNumber=${prodId.value}`)

      nextStickerNumber.value = response.data.nextPage || 1
      fromPage.value = nextStickerNumber.value
      toPage.value = nextStickerNumber.value
    } catch (error) {
      console.error("Error fetching next sticker number:", error)
    }
  }
}

// Fungsi untuk menangani tekan tombol Enter
const handleKeydown = event => {
  if (event.key === "Enter") {
    fetchProdData()
    fetchNextStickerNumber()
    fetchMachine()
  }
}

onMounted(() => {
  fetchTypeLabel() // Ambil typelabel saat mounted
  fetchShift() // Ambil shift options saat mounted
  fetchUnit() // Ambil unit options saat mounted
})

watchEffect(() => {
  totalPage.value = Math.max(toPage.value - fromPage.value + 1, 1)
})

// Fungsi untuk mencetak barcode
const printBarcode = async () => {
  try {
    const params = {
      unit_id: unit.value,
      shift_id: shift.value,
      pengawas: pengawas.value,
      operator: operator.value,
      type_id: typelabel.value,
      prod_date: prodDate.value,
      prod_id: prodId.value,
      from_page: fromPage.value,
      to_page: toPage.value,
      showQrCode: showQrCode.value,
      machine: ivsMachine.value,
      showMachineNumber: showMachineNumber.value,
      showCodeContainer: showCodeContainer.value,
      code_container: code_container.value,
    }

    const response = await axiosIns.post("/barcodes/print/barcode", params, {
      responseType: "blob",
    })

    const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }))

    window.open(url, "_blank")
  } catch (error) {
    console.log(error)
    if (error.response && error.response.data) {
      const reader = new FileReader()

      reader.onload = function () {
        try {
          const jsonError = JSON.parse(reader.result)
          const errorMessage = jsonError.message || "Terjadi kesalahan!"

          toast.error(errorMessage)
        } catch (e) {
          toast.error("Terjadi kesalahan dalam membaca response!")
        }
      }
      reader.readAsText(error.response.data)
    } else {
      toast.error("Terjadi kesalahan pada server!")
    }
  }
}

// Fungsi untuk validasi form sebelum mencetak
const validateForm = () => {
  refForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid) {
      printBarcode()
    }
  })
}
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VBtn
        prepend-icon="tabler-chevron-left"
        :to="{ name: 'barcode-inquiries' }"
      >
        Back
      </VBtn>
      <VCard>
        <VCardText>
          <h3>
            {{ `Cetak ${nametype}` }}
          </h3>
        </VCardText>
      </VCard>
      <VCard>
        <VCardText class="d-flex gap-4">
          <VForm ref="refForm">
            <VRow>
              <VCol
                cols="12"
                md="4"
              >
                <VTextField
                  v-model="prodId"
                  label="ID PRODUKSI"
                  type="text"
                  required
                  :rules="[requiredValidator]"
                  clearable
                  @keydown="handleKeydown"
                />
              </VCol>
              <VCol
                cols="12"
                md="4"
              >
                <AppDateTimePicker
                  v-model="prodDate"
                  label="TANGGAL PRODUKSI"
                  placeholder="YYYY-MM-DD"
                  required
                  format="yyyy-MM-dd"
                  :rules="[requiredValidator]"
                />
              </VCol>
              <VCol
                cols="12"
                md="4"
              >
                <VSelect
                  v-model="shift"
                  :items="shiftOptions"
                  label="SHIFT"
                  item-value="id"
                  item-title="name"
                  required
                />
              </VCol>
              <VCol
                cols="12"
                md="3"
              >
                <VTextField
                  v-model="fromPage"
                  label="STIKER NO. (FROM)"
                  type="number"
                  min="1"
                  readonly
                />
              </VCol>
              <VCol
                cols="12"
                md="3"
              >
                <VTextField
                  v-model="toPage"
                  label="HINGGA"
                  type="number"
                  min="1"
                  clearable
                  required
                />
              </VCol>
              <VCol
                cols="12"
                md="3"
              >
                <VTextField
                  v-model="totalPage"
                  label="JUMLAH"
                  readonly="true"
                  type="number"
                  :value="totalPage"
                  min="1"
                />
              </VCol>
              <VCol
                cols="12"
                md="3"
              >
                <VSelect
                  v-model="unit"
                  :items="unitOptions"
                  label="UNIT"
                  item-value="id"
                  item-title="name"
                  required
                />
              </VCol>
              <VCol
                v-if="showRebbeca"
                cols="12"
                md="4"
              >
                <VTextField
                  v-model="barcode"
                  label="NO BARCODE"
                  clearable
                  type="text"
                />
              </VCol>
              <VCol
                v-if="showRebbeca"
                cols="12"
                md="4"
              >
                <VTextField
                  v-model="newsize"
                  label="SIZE"
                  clearable
                  type="text"
                />
              </VCol>
              <VCol
                v-if="showRebbeca"
                cols="12"
                md="4"
              >
                <VTextField
                  v-model="batch"
                  label="BATCH"
                  clearable
                  type="text"
                />
              </VCol>
              <VCol
                cols="12"
                md="4"
              >
                <VTextField
                  v-model="pengawas"
                  label="PENGAWAS"
                  clearable
                  type="text"
                />
              </VCol>
              <VCol
                cols="12"
                md="4"
              >
                <VTextField
                  v-model="operator"
                  label="OPERATOR"
                  clearable
                  type="text"
                />
              </VCol>
              <VCol
                cols="12"
                md="4"
              >
                <VTextField
                  v-model="code_container"
                  label="CODE CONTAINER"
                  type="text"
                />
              </VCol>
              
              
              <VCol
                cols="12"
                md="3"
              >
                <VCheckbox
                  v-model="showQrCode"
                  label="Tampilkan Qr Code?"
                />
              </VCol>
              <VCol
                cols="12"
                md="3"
              >
                <VCheckbox
                  v-model="showCodeContainer"
                  label="Tampilkan Code Container?"
                />
              </VCol>
              <!-- Kondisi untuk menampilkan select mesin jika ivs_machine kosong -->
              <VCol
                v-if="showMachineSelect"
                cols="12"
                md="3"
              >
                <VSelect
                  v-model="ivsMachine"
                  :items="machineOptions"
                  label="PILIH MESIN"
                  item-value="id"
                  item-title="name"
                  required
                />
              </VCol>
              <VCol
                cols="12"
                md="3"
              >
                <VCheckbox
                  v-model="showMachineNumber"
                  label="Tampilkan Kode Mesin?"
                />
              </VCol>
              <VCol cols="12">
                <VBtn
                  prepend-icon="tabler-printer"
                  @click="validateForm"
                >
                  PRINT
                </VBtn>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>

<route lang="yaml">
meta:
  action: Read
  subject: Barcode
  redirectIfLoggedIn: false
</route>
