<script setup> 
import axiosIns from '@/plugins/axios'
import { computed, ref } from 'vue'

const props = defineProps({
    enums: {
        type: Boolean,
        required: true,
    },
})

const emit = defineEmits(['saved'])
const enums = ref(computed(() => props.enums + 1))
const name = ref()
const description = ref()
const enumNumber = ref()

const isVisible = ref(false)

const showLoading = ref(false)

const saved = ref(false)

const refForm = ref()

const closeDialog = () => {
    description.value = ''
    name.value = ''
    enums.value = 0
    isVisible.value = false
}

const createCases = async () => {
    try {
        const { data } = await axiosIns.post('/sat/cases', {
            name: name.value,
            description: description.value,
            enum_number: enums.value
        })
        if (data.status === 'success') {
            console.log(data)
        }
        closeDialog()
        emit('saved', true)
    } catch (error) {
        console.log(error)
    }
}

const validateFom = () => {
    refForm.value?.validate().then(({ valid: isValid }) => {
        if (isValid) {
            createCases()
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
      <template #activator="{props}">
        <VBtn
          v-bind="props"
          prepend-icon="tabler-plus"
        >
          Add
        </VBtn>
      </template>
      <DialogCloseBtn @click="closeDialog" />
      <VOverlay v-model="showLoading" />
      <VCard :loading="showLoading">
        <VCardTitle>Add Cases</VCardTitle>
        <VDivider />
  
        <VCardText>
          <VForm
            ref="refForm"
            @submit.prevent="validateFom"
          >
            <VRow>
                <VCol cols="4">
                    <VTextField
                    v-model="enums"
                    variant="filled"
                    readonly
                    label="Enum Number"
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