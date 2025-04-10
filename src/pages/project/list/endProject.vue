<script setup>
import { requiredValidator } from "@/@core/utils/validators"
import axiosIns from "@/plugins/axios"
import { not } from "@vueuse/math"
import Swal from "sweetalert2"

const props = defineProps({
  projectId: ({
    type: String
  })
})

const emit = defineEmits(['refresh'])
const note = ref('')
const isVisible = ref(false)
const showLoading = ref(false)

const endProject = async (id) => {
  showLoading.value = true
  
  try {
    const ret = await axiosIns.patch(`/project/line/execution/done/${id}`, 
    {
      note: note.value
    })

    emit('refresh')

    showLoading.value = false
  } catch(error) {
    Swal.fire({
      title: 'LBG',
      icon: 'error',
      text: error,
    })
  }
  finally{showLoading.value = false}
}
const taskForm = ref(null)
const onSubmit = () => {
  taskForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid) {
      endProject(props.projectId),
      isVisible.value = false
      note.value = ''
    }
  })
}

const cancelClickHandler = () => {
  isVisible.value = false
  note.value = ''
}
</script>

<template>
  <VDialog v-model="isVisible" :width="600" persistent>
    <template #activator="{props}">
      <VListItemTitle v-bind="props">
        <VIcon
            variant="none"
            density="compact"
            color="error"
            size="24"
            class="me-3"
            icon=" mdi-stop-circle-outline"
            />
            End
      </VListItemTitle>
    </template>
    <VCard>
      <VCardTitle class="text-center text-h6">
        Sure Ended Project Now?
      </VCardTitle>
      <VCardText>
        <VForm ref="taskForm" @submit.prevent="onSubmit" style="height: auto;">
          <VRow>
              <VCol cols="12">
                <VTextarea 
                label="Enter a note (optional) " 
                v-model="note"
                rows="2"
                class="mt-4"
              />
              </VCol>
          </VRow>
          <VRow>
            <VCol cols="12">
              <div class="d-flex gap-4 justify-center ">
                <VBtn color="warning" @click="cancelClickHandler">cancel</VBtn>
                <VBtn color="primary" type="submit" >yes, end now!</VBtn>
              </div>
            </VCol>
          </VRow>
        </VForm>
      </VCardText>
    </VCard>
  </VDialog>
</template>