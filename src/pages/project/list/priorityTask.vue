<script setup>
import axiosIns from "@/plugins/axios";
import { ref,  inject } from "vue";
import { useToast } from "vue-toastification";

const isOpen = ref(false)

const projectPriority = inject("priorityTask");
</script>

<template>
  <div>
    <VTooltip location="top">
      <template v-slot:activator="{ props }">
        <VBtn 
          v-bind="props" 
          icon="mdi-help-circle-outline" 
          variant="text"
          size="small"
          @click="isOpen = true"
        />
      </template>
      <span>About Priority</span>
    </VTooltip>
    <VDialog v-model="isOpen" max-width="600">
    <VCard>
        <VCardTitle>Levels and Meanings</VCardTitle>
        <VCardText>
        <VList>
            <VListItem v-for="priority in projectPriority" :key="priority.code">
            <VListItemContent>
                <VListItemTitle class="font-weight-bold">
                {{ priority.description }}
                </VListItemTitle>
                <VListItemSubtitle class="wrap-text">
                {{ priority.detail }}
                </VListItemSubtitle>
                <VSpacer />
            </VListItemContent>
            </VListItem>
        </VList>
        </VCardText>
        <VCardActions>
        <VSpacer class="mt-2"/>
        <VBtn color="primary" @click="isOpen = false">Tutup</VBtn>
        </VCardActions>
    </VCard>
    </VDialog>
  </div>
</template>

<style>
.wrap-text {
  white-space: normal !important;
  overflow: visible !important;
  text-overflow: initial !important;
  display: block !important;
  word-break: break-word;
}
</style>