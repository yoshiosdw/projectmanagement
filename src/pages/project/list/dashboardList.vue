<script setup>
import axiosIns from '@/plugins/axios'
import Swal from 'sweetalert2'
import { watchEffect } from 'vue'
import { useProject } from './useProjectStore'

const emit = defineEmits(['statusproject'])
const projectStore = useProject()
const inprogress = ref([])
const todo = ref([])
const hold = ref([])
const done = ref([])   
const overdue = ref([])   
const ontrack = ref([])   

const fetchData = async () => {

try {
  const ret = await axiosIns.get(`/project/dashboard`)
  
  inprogress.value = ret.data[0].total_in_progress
  todo.value = ret.data[0].total_todo
  done.value = ret.data[0].total_done
  hold.value = ret.data[0].total_hold
  overdue.value = ret.data[0].total_overdue
  ontrack.value = ret.data[0].total_onTrack
  console.log('Data', inprogress.value)

} catch (error) {
  Swal.fire({
    title: 'LBG',
    icon: 'error',
    text: error,
  })
} finally {
}
}

watchEffect(() => {
  fetchData()
})

const redirectToList = val => {
  projectStore.clickedStatus = projectStore.clickedStatus === val ? null : val;
  emit("statusproject", projectStore.clickedStatus);
}
</script>

<template>
    <VRow>
        <VCol cols="12">
      <VCard>
        <VCardTitle class="text-center mb-4">
          Status Project Management
        </VCardTitle>
        
        <VCardText :loading="isLoading">
          <VRow>
            <VCol
            cols="2"
            class="text-center"
            :class="{ 'background-clicked': projectStore.clickedStatus == 0 }"
            :loading="isLoading"
            @click="redirectToList(0)"
            style="cursor: pointer;"
            >
              
              <h2 class="text-center">
                {{ todo }}
              </h2>
              <VSpacer class="mt-2" />
              <p class="text-center" style="margin-bottom:-2px">
                To Do
              </p>
            </VCol>
            <VDivider vertical />
            <VCol
              cols="2"
              class="text-left"
              :class="{ 'background-clicked': projectStore.clickedStatus == 1 }"
              :loading="isLoading"
              @click="redirectToList(1)"
              style="cursor: pointer;"
              >
            
              <h2 class="text-center" style="color: #00CFE8">
                {{ inprogress }}
              </h2>
              <VSpacer class="mt-2" />
              <p class="text-center" style="margin-bottom:-2px" >
                In Progress
              </p>
            </VCol>
            <VDivider vertical />
            <VCol
              cols="2"
              class="text-left"
              :class="{ 'background-clicked': projectStore.clickedStatus == 2 }"
              :loading="isLoading"
              @click="redirectToList(2)"
              style="cursor: pointer;"
            >
              <h2 class="text-center" style="color: #28C76F;">
                {{ done }}
              </h2>
              <VSpacer class="mt-2" />
              <p class="text-center" style="margin-bottom:-2px">
                Done
              </p>
            </VCol>
            <VDivider vertical />
            <VCol
              cols="2"
              class="text-left"
              :class="{ 'background-clicked': projectStore.clickedStatus == 3 }"
              :loading="isLoading"
              @click="redirectToList(3)"
              style="cursor: pointer;"
            >
              <h2 class="text-center" style="color: #050C9C;">
                {{ hold }}
              </h2>
              <VSpacer class="mt-2" />
              <p class="text-center" style="margin-bottom:-2px">
                Hold
              </p>
            </VCol>
            <VDivider vertical />
            <VCol
              cols="2"
              class="text-left"
              :class="{ 'background-clicked': projectStore.clickedStatus == 4 }"
              :loading="isLoading"
              @click="redirectToList(4)"
              style="cursor: pointer;"
            >
              <h2 class="text-center" style="color: red;">
                {{ overdue }}
              </h2>
              <VSpacer class="mt-2" />
              <p class="text-center" style="margin-bottom:-2px">
                Over Due
              </p>
            </VCol>
            <VDivider vertical />
            <VCol
              cols="2"
              class="text-left"
              :class="{ 'background-clicked': projectStore.clickedStatus == 5 }"
              :loading="isLoading"
              @click="redirectToList(5)"
              style="cursor: pointer;"
            >
              <h2 class="text-center" style="color: orange;">
                {{ ontrack }}
              </h2>
              <VSpacer class="mt-2" />
              <p class="text-center" style="margin-bottom:-2px">
                On Track
              </p>
            </VCol>
          </VRow>
        </VCardText>
      </VCard>
    </VCol>
    </VRow>
</template>

<style>
.background-clicked {
  background-color: #efefef !important;
}
</style>



