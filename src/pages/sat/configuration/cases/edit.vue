<script setup>
import DialogCloseBtn from '@/@core/components/DialogCloseBtn.vue'
import { requiredValidator } from '@/@core/utils/validators'
import axiosIns from '@/plugins/axios'
import Swal from 'sweetalert2'
import { watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { useToast } from 'vue-toastification'

const props = defineProps({
  headerId:{
    type: String,
    default: null,
  },
})

const emit = defineEmits(['saved', 'closed'])

const waiting = ref(false)

const casesId = ref(props.headerId)

const toast = useToast()

const isVisible = ref(false)

const refForm = ref()

const showLoading = ref(false)

const name = ref()
const description = ref()
const enumNumber = ref()

const cases = ref([])


const closeDialog = () => {
  isVisible.value = false

  // clearForm()
  emit('closed', true)
}

const fetchCasesId = async casesId => {
  showLoading.value = true
  try {
    const ret = await axiosIns.get(`/sat/cases/${casesId}` )

    showLoading.value = false

    cases.value = ret.data.data[0]
    name.value = cases.value.name
    description.value = cases.value.description
    enumNumber.value = cases.value.enum_number
  } catch(error) {
    Swal.fire({
      title: 'LBG',
      icon: 'error',
      text: error,
    })
  }
}

const editCases = (() => {
  waiting.value = true
  fetchCasesId(casesId.value)
})

const modifyCases = async id => {
  showLoading.value = true
  try {
    const ret = await axiosIns.patch(`sat/cases/${id}`, {
      name            : name.value,
      description     : description.value,
      enum_number     : enumNumber.value,
    } )

    emit('saved', true)

    isVisible.value = false    
    showLoading.value = false

  } catch (error) {
    console.log(error)
    toast.error('Failed edit data')
  } finally {
    showLoading.value = false
  }
}

const validateFom = ()=>{
  refForm.value?.validate().then(({ valid: isValid })=>{
    if(isValid){
      modifyCases(casesId.value)
    }
  })
};
</script>

<template>
  <div>
    <VDialog
      v-model="isVisible"
      width="1024"
      transition="dialog-bottom-transition"
      persistent
      z-index="1024"
    >
      <template #activator="{props: activatorProps}">
        <VIcon
          v-bind="activatorProps"
          :size="22"
          icon="tabler-edit"
          @click="editCases"
        />
      </template>
      
      <DialogCloseBtn @click="closeDialog" />
      <VOverlay v-model="showLoading" />
      <VCard :loading="showLoading">
        <VCardTitle>Edit Cases</VCardTitle>
        <VDivider />
        <VCardText>
          <VForm
            ref="refForm"
            @submit.prevent="validateFom"
          >
            <VRow>
              <VCol cols="4">
                <VTextField
                  v-model="enumNumber"
                  label="Enum Number"
                  readonly
                  variant="filled"
                  :rules="[requiredValidator]"
                />
              </VCol>
            </VRow>
            <VRow>
              <VCol cols="4">
                <VTextField
                  v-model="name"
                  label="Name"
                  :rules="[requiredValidator]"
                />
              </VCol>
              <VCol cols="8">
                <VTextField
                  v-model="description"
                  label="Description"
                  :rules="[requiredValidator]"
                />
              </VCol>
            </VRow>
            
            <VRow
              class="mt-3"
            >
              <VCol
                cols="12"
                class="d-flex justify-end gap-3"
              >
                <VBtn
                  color="warning"
                  :disabled="showLoading"
                  @click="closeDialog"
                >
                  Cancel
                </VBtn>
  
                <VBtn
                  color="error"
                  :disabled="showLoading"
                  @click="validateFom"
                >
                  Save
                </VBtn>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </VDialog>
  </div>
</template>

<route lang="yaml">
  meta:
    action: Read
    subject: SAT
    redirectIfLoggedIn: false
</route>