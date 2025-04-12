<script setup>
import axiosIns from '@/plugins/axios'
import Swal from 'sweetalert2'
import { requiredValidator } from "@/@core/utils/validators"
import { onMounted, ref, watchEffect } from "vue"
import { useToast } from "vue-toastification"
import { useRoute, useRouter } from "vue-router" 
import polos from '@/assets/barcodes/polos.png'
import rebbecaV1 from '@/assets/barcodes/rebbeca-v1.png'
import japanKyoei from '@/assets/barcodes/japan-kyoei.png'
import japanOrdiy from '@/assets/barcodes/japan-ordiy.png'
import japanTanpaUkuran from '@/assets/barcodes/japan-tanpa-ukuran.png'
import merahBlank from '@/assets/barcodes/merah-blank.png'
import merah from '@/assets/barcodes/merah.png'
import plantf from '@/assets/barcodes/plant-f.png'
import polos83 from '@/assets/barcodes/polos-83.png'
import polosBlank from '@/assets/barcodes/polos-blank.png'
import polosQuantity from '@/assets/barcodes/polos-quantity.png'
import rebbeca from '@/assets/barcodes/rebbeca.png'

const imageMapping = {
  'polos.png': polos,
  'rebbeca-v1.png': rebbecaV1,
  'japan-kyoei.png': japanKyoei,
  'japan-ordiy.png': japanOrdiy,
  'japan-tanpa-ukuran.png': japanTanpaUkuran,
  'merah-blank.png': merahBlank,
  'merah.png': merah,
  'plant-f.png': plantf,
  'polos-83.png': polos83,
  'polos-blank.png': polosBlank,
  'polos-quantity.png': polosQuantity,
  'rebbeca.png': rebbeca,
}

console.log('Image Mapping:', imageMapping)


// State untuk data typelabel
const typelabels = ref([]) // Untuk menyimpan data typelabel
const showLoading = ref(false) // Untuk loading state
const findText = ref('') // Untuk input pencarian
const perPage = ref(10) // Jumlah item per halaman
const currentPage = ref(1) // Halaman saat ini
const totalItems = ref(0) // Total jumlah item
const totalPages = ref(0) // Total halaman

// Fungsi untuk fetch data dari API
const fetchTypeLabels = async () => {
  showLoading.value = true
  try {
    const response = await axiosIns.get('/typelabel', {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('sinarjoAccessToken'),
      },
      params: {
        page: currentPage.value,
        perPage: perPage.value,
        find: findText.value,
      },
    })

    typelabels.value = response.data.data
    totalItems.value = response.data.meta.total // Total item
    totalPages.value = response.data.meta.last // Total halaman
  } catch (error) {
    Swal.fire({
      title: 'Error',
      text: error.response?.data?.message || 'Failed to fetch typelabels',
      icon: 'error',
    })
  } finally {
    showLoading.value = false
  }
}

const search = () => {
  currentPage.value = 1 // Reset ke halaman pertama saat pencarian
  fetchTypeLabels()
}

const refresh = () => {
  findText.value = '' // Kosongkan input pencarian
  currentPage.value = 1 // Reset ke halaman pertama
  fetchTypeLabels()
}

watch(currentPage, () => {
  fetchTypeLabels()
})

const paginationData = computed(() => {
  const firstIndex = totalItems.value ? (currentPage.value - 1) * perPage.value + 1 : 0
  const lastIndex = Math.min(perPage.value * currentPage.value, totalItems.value)
  
  return `Showing ${firstIndex} to ${lastIndex} of ${totalItems.value} entries`
})

const handleImageError = typelabel => {
  console.error(`Failed to load image for typelabel: ${typelabel.name}, File: ${typelabel.images}`)
}


//Form 
const toast = useToast()
const route = useRoute() 
const router = useRouter() 

// Refs untuk form fields
const prodId = ref()
const prodDate = ref(new Date().toISOString().split("T")[0]) 
const typelabel = ref(null) 
const nametype = ref("") 
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
const noBarcode = ref("")
const batch = ref("")
const newsize = ref("")
const showQrCode = ref(true)
const showMachineNumber = ref(true)
const showCodeContainer = ref(true)
const refForm = ref()
const ivsMachine = ref("")
const showMachineSelect = ref(false)
const showRebbeca = ref(false)
const shift = ref() 
const unit = ref() 
const machine = ref()

const fetchShift = async () => {
  try {
    const res = await axiosIns.get("/shift")

    shiftOptions.value = res.data.data
  } catch (error) {
    console.log(error)
  }
}

const fetchUnit = async () => {
  try {
    const res = await axiosIns.get("/units")

    unitOptions.value = res.data.data
  } catch (error) {
    console.log(error)
  }
}

const fetchMachine = async () => {
  try {
    const res = await axiosIns.get("/barcodes/get-machine")

    machineOptions.value = res.data.data
  } catch (error) {
    console.log(error)
  }
}

const fetchProdData = async () => {
  if (!prodId.value) {
    return 
  }
  try {
    console.log(`Fetching product data for: ${prodId.value}`)

    const response = await axiosIns.get(`/barcodes/get-product?boNumber=${prodId.value}`)

    console.log("Product Data Response:", response.data)
    ivsMachine.value = response.data.data[0].IVS_MESIN || "" 
    console.log("IVS_MESIN:", ivsMachine.value) 
    if (!ivsMachine.value) {
      showMachineSelect.value = true
      fetchMachine() 
    } else {
      showMachineSelect.value = false 
    }
  } catch (error) {
    console.error("Error fetching product data:", error)
    toast.error("Product ID/Item ID tidak ditemukan!")
  }
}

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

const fetchProdDataAndNextSticker = async () => {
  if (!prodId.value) {
    return
  }
  showLoading.value = true // Tampilkan loading saat proses dimulai
  try {
    await fetchProdData() // Ambil data produk
    await fetchNextStickerNumber() // Ambil nomor stiker berikutnya

  } catch (error) {
    console.error("Error fetching data:", error)
    toast.error("Terjadi kesalahan dalam mengambil data!")
  } finally {
    showLoading.value = false // Sembunyikan loading setelah selesai
  }
}

const handleKeydown = event => {
  if (event.key === "Enter") {
    fetchProdData()
    fetchNextStickerNumber()
    fetchMachine()
  }
}

onMounted(() => {
  fetchTypeLabels() 
  fetchShift() 
  fetchUnit() 
})
watchEffect(() => {
  totalPage.value = Math.max(toPage.value - fromPage.value + 1, 1)
})

const printBarcode = async type_id => {
  try {
    const params = {
      unit_id: unit.value,
      shift_id: shift.value,
      pengawas: pengawas.value,
      operator: operator.value,
      type_id: type_id,
      prod_date: prodDate.value,
      prod_id: prodId.value,
      from_page: fromPage.value,
      to_page: toPage.value,
      showQrCode: showQrCode.value,
      machine: ivsMachine.value,
      showMachineNumber: showMachineNumber.value,
      showCodeContainer: showCodeContainer.value,
      code_container: code_container.value,
      barcode: noBarcode.value,
      newsize: newsize.value,
      batch: batch.value,
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
const validateFormAndPrint = type_id => {
  refForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid) {
      printBarcode(type_id)
    }
  })
}
</script>

<template>
  <VRow>
    <!-- Overlay untuk loading -->
    <VOverlay v-model="showLoading" />
    <VCol cols="12">
      <VCard>
        <VCardText>
          <h3>
            Cetak Label Barcodes
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
                  @blur="fetchProdDataAndNextSticker"
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
                  :rules="[requiredValidator]"
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
                  :rules="[requiredValidator]"
                />
              </VCol>
              <VCol
                cols="12"
                md="4"
              >
                <VTextField
                  v-model="noBarcode"
                  label="NO BARCODE"
                  clearable
                  type="text"
                />
              </VCol>
              <VCol
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
                  :rules="[requiredValidator]"
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
                  :rules="[requiredValidator]"
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
              
              <VCol
                cols="12"
                md="3"
              >
                <VCheckbox
                  v-model="showMachineNumber"
                  label="Tampilkan Kode Mesin?"
                />
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </VCol>
    <VCol cols="12">
      <VCard :loading="showLoading">
        <VCardText class="d-flex gap-4 align-center">
          <h4>Pilih Jenis Label</h4>
          <!-- Input pencarian -->
          <VTextField
            v-model="findText"
            placeholder="Search TypeLabel"
            clearable
            @keydown.enter="search"
          />
          <!-- Tombol Search -->
          <VBtn
            color="primary"
            prepend-icon="tabler-search"
            @click="search"
          >
            Search
          </VBtn>
          <!-- Tombol Refresh -->
          <VBtn
            prepend-icon="tabler-refresh"
            color="success"
            @click="refresh"
          >
            Refresh
          </VBtn>
        </VCardText>
      </VCard>
    </VCol>
    <!-- Looping untuk setiap typelabel -->
    <VCol
      v-for="typelabel in typelabels"
      :key="typelabel.id"
      cols="4"
    >
      <!-- Kotak yang bisa diklik -->
      <VCard
        class="cursor-pointer"
        @click="validateFormAndPrint(typelabel.id)"
      >
        <VCardText>
          <!-- Container utama -->
          <VRow class="d-flex flex-column align-start">
            <!-- Baris pertama: Nama dan Tombol Panah -->
            <VCol
              cols="12"
              class="d-flex justify-space-between align-center"
            >
              <h4>{{ typelabel.name }}</h4>
              <VBtn
                icon="tabler-chevron-right"
                color="primary"
                variant="tonal"
                size="small"
                @click.stop="goToAddForm(typelabel.id)"
              />
            </VCol>
            <!-- Divider -->
            <VCol cols="12">
              <VDivider class="my-2" />
            </VCol>
            <!-- Gambar -->
            <VCol
              cols="12"
              class="text-center"
            >
              <img
                :src="imageMapping[typelabel.images] || '/src/assets/barcodes/polos.png'"
                alt="Image"
                style="max-width: 70%; height: auto; object-fit: cover;"
                @error="handleImageError(typelabel)"
              >
            </VCol>
          </VRow>
        </VCardText>
      </VCard>
    </VCol>
    <!-- Pagination -->
    <VCol cols="12">
      <VCard>
        <VCardText class="d-flex align-center flex-wrap justify-space-between gap-4 py-3 px-5">
          <span class="text-sm text-disabled">{{ paginationData }}</span>
          <VPagination
            v-model="currentPage"
            size="small"
            :total-visible="5"
            :length="totalPages"
          />
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
