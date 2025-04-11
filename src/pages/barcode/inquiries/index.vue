<script setup>
import axiosIns from '@/plugins/axios'
import Swal from 'sweetalert2'
import { ref, onMounted, computed, watch } from 'vue'
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

// Fungsi untuk melakukan pencarian
const search = () => {
  currentPage.value = 1 // Reset ke halaman pertama saat pencarian
  fetchTypeLabels()
}

// Fungsi untuk refresh data
const refresh = () => {
  findText.value = '' // Kosongkan input pencarian
  currentPage.value = 1 // Reset ke halaman pertama
  fetchTypeLabels()
}

// Fetch data saat komponen dimuat
onMounted(() => {
  fetchTypeLabels()
})

// Watch perubahan halaman
watch(currentPage, () => {
  fetchTypeLabels()
})

// Pagination data
const paginationData = computed(() => {
  const firstIndex = totalItems.value ? (currentPage.value - 1) * perPage.value + 1 : 0
  const lastIndex = Math.min(perPage.value * currentPage.value, totalItems.value)
  
  return `Showing ${firstIndex} to ${lastIndex} of ${totalItems.value} entries`
})

// Handle error jika gambar gagal dimuat
const handleImageError = typelabel => {
  console.error(`Failed to load image for typelabel: ${typelabel.name}, File: ${typelabel.images}`)
}
</script>

<template>
  <VRow>
    <!-- Overlay untuk loading -->
    <VOverlay v-model="showLoading" />

    <VCol cols="12">
      <VCard :loading="showLoading">
        <VCardText class="d-flex gap-4 align-center">
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

    <VCol cols="12">
      <VCard :loading="showLoading">
        <VCardText class="d-flex gap-4">
          <h4>Pilih Jenis Label</h4>
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
        :to="{ name: 'barcode-inquiries-typelabel', params: { typelabel: typelabel.id } }"
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
