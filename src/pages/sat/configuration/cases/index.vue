<script setup>
import axiosIns from '@/plugins/axios'
import Swal from 'sweetalert2'
import { ref, watchEffect } from 'vue'
import Edit from './edit.vue'
import Add from './add.vue'

const cases = ref([])
const page = ref(1)
const perPage = ref(10)
const find = ref('')
const findText = ref('')
const last = ref(0)
const from = ref(0)
const to = ref(0)
const total = ref(0)
const lastEnum = ref(0) 
const isLoading = ref(true)

const enums = ref()

const headers = ref([
  { title: 'Action', key: 'action', sortable: false },
  { title: 'Name', key: 'name'}, 
  { title: 'Description', key: 'description'},
  { title: 'Enum Number', key: 'enum_number'},
])

const fetchCases = async (page, perPage, find) => {
    isLoading.value = true;
    try {
        const params = {
            page: page,
            perPage: perPage,
            find: find
        }
        const response = await axiosIns.get('/sat/cases', {
            params: params
        })
        isLoading.value = false
        cases.value = response.data.data
        last.value = response.data.meta.last        
        from.value = response.data.meta.from
        to.value = response.data.meta.to
        total.value = response.data.meta.total
    } catch (error) {
        isLoading.value = false
        console.log(error)
    }
}

const fetchCasesEnum = async () => {
    isLoading.value = true;
    try {
        
        const response = await axiosIns.get('/sat/cases/last')
        isLoading.value = false

        lastEnum.value = response.data
    } catch (error) {
        isLoading.value = false
        console.log(error)
    }
}

const deleteData = async id => {
  isLoading.value =  true
  try {
    const ret = await axiosIns.delete(`/sat/cases/${id}` )

    fetchCases(page.value, perPage.value, find.value)
  } catch (error) {
    Swal.fire({
      title: 'LBG',
      text: 'Delete data failed',
      icon: 'error',
    })
    console.log(error)
    isLoading.value = false
  }
}

const btnDeleteClickHandler = id => {
  Swal.fire({
    title: 'LBG',
    text: 'Sure delete data?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: 'warning',
    cancelButtonColor: 'primary',
    confirmButtonText: 'Yes, delete it!',
  }).then(ret => {
    if(ret.isConfirmed) {
      deleteData(id)
    }
  })
}

const clearHandle = () => {
  find.value = ''
}

const findData = async ()=>{
  page.value = 1
  perPage.value = 10
  find.value = findText.value
}

watchEffect(() => {
    fetchCases(page.value, perPage.value, find.value)
    fetchCasesEnum()
})

const handleSaved = () => {
  fetchCases(page.value, perPage.value, find.value)
  fetchCasesEnum() 
}

const paginationData = computed(() => {
  return `Showing ${from.value} to ${to.value} of ${total.value} entries`
});
</script>

<template>
<VRow>
    <VCol cols="12">
      <VOverlay v-model="isLoading"/>
      <VCard :isLoading="isLoading">
        <VCardTitle style=" margin-bottom: 16px;">Cases SAT</VCardTitle>
        <VDivider class="mb-2"/>
        <VCardText class="d-flex justify-start gap-4">
          <div style="min-width: 80px;">
            <VSelect 
              v-model="perPage"
              :items="[10,20,30,50]"
            />
          </div>

          <VTextField
            v-model="findText"
            label="Search"
            @keydown.enter="findData"
            clearable
            @click:clear="clearHandle"
            />

          <VBtn>
            <Add :enums="lastEnum" @saved="handleSaved"/>
          </VBtn>

        </VCardText>
        <VDataTable
        :headers="headers"
        :items="cases"
        class="elevation-1 text-no-wrap text-uppercase"
        hide-default-footer
        :header-props="{ style: 'background-color: #E5E5E5; color: black;'}"
        :items-per-page="perPage"
        >

        <template v-slot:item.enum_number="{ item }">
          <div class="text-center">{{ item.enum_number }}</div>
        </template>

        <template v-slot:item.action="{ item }">
          <VBtn
              variant="text"
              color="info"
              size="20"
              >
          
          <Edit :header-id="item.id" @saved="fetchCases(page, perPage, find)"/>
          </VBtn>
          <VBtn
              icon="mdi-trash-can-outline"
              color="error"
              variant="text"
              size="20"
              style="margin-right: 10px;"
              @click="btnDeleteClickHandler(item.id)"
          ></VBtn>
        </template>
        
        <template v-slot:item.parent.name="{ item }">
            {{ item.parent && item.parent.name ? item.parent.name : '-' }}
        </template>
        </VDataTable>
        <VCardText class="d-flex align-center flex-wrap justify-space-between gap-4 py-3 px-5">
          <span 
          class="text-sm text-disabled">
            {{ paginationData }}
          </span>
          <VPagination
            v-model="page"
            size="small"
            :total-visible="5"
            :length="last"
          />
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>

<route lang="yaml">
    meta:
    action: Read
    subject: SAT
    redirectIfLoggedIn: false
</route>