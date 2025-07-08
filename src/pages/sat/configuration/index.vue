<script setup>
import Cases from './cases/index.vue'

const configTab = ref(null)

const tabs = [
  {
    title: 'Cases',
  },
]
</script>

<template>
  <VRow>
    <VCol
      cols="3"
      class="mt-5"
    >
      <VTabs
        v-model="configTab"
        direction="vertical"
        class="v-tabs-pill"
      >
        <VTab
          v-for="tab in tabs"
          :key="tab.title"
        >
          <span>{{ tab.title }}</span>
        </VTab>
      </VTabs>
    </VCol>
    <VCol cols="9">
      <VWindow
        v-model="configTab"
        class="mt-6 disable-tab-transition"
        :touch="false"
      >
        <VWindowItem>
          <Cases />
        </VWindowItem>
      </VWindow>
    </VCol>
  </VRow>
</template>

<style scoped>
.v-tabs-vertical {
  height: 100%;
  border-right: 1px solid #e0e0e0;
}

.v-tabs-vertical .v-tab {
  align-items: start;
  justify-content: start;
}
</style>

<route lang="yaml">
meta:
  action: Read
  subject: SAT
  redirectIfLoggedIn: false
</route>

