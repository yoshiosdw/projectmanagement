<script setup>
import axiosIns from '@/plugins/axios'
import { useToast } from 'vue-toastification'
import { ref, computed, watchEffect } from 'vue'
import NotifSat from '../lookup/notification/notifSat.vue'

const inbox = ref([])
const toast = useToast()
const showLoading = ref(false)

const find = ref()
const from = ref()
const to = ref()
const last = ref()
const total = ref()
const page = ref(1)
const perPage = ref(10)

const checked = ref([])
const checkedAll = ref(false)

const satId = ref()
const isNotif = ref(false)

const args = reactive({
  page: 1,
  per_page: 10,
  find: '',
})
  
const meta = reactive({
  total: 0,
  from: 0,
  to: 0,
  last: 0,
})

const fetchInbox = async () => {
  showLoading.value = true
  try {
    const ret = await axiosIns.get('/notifications/inbox', { params: { ...args } })

    inbox.value = ret.data.data
  
    meta.total = ret.data.meta.total
    meta.last = ret.data.meta.last
    meta.from = ret.data.meta.from
    meta.to = ret.data.meta.to

    checkedAll.value = false
  } catch (error) {
    toast.error('Failed Load Data')
    console.log(error)
  } finally {
    showLoading.value = false
  }
}

watchEffect(() => {
  fetchInbox()
})

watch(checkedAll, newVal => {
  checked.value = newVal ? inbox.value.map(item => item.id) : []
})

const markAsRead = async data => {

  satId.value = data
  isNotif.value = true

  // try {
  //   await axiosIns.post(`/notifications/read/${id}`, { })


  // } catch (error) {
  //   toast.error('Failed to mark as read')
  // }
}

const getClosed = () => {
  isNotif.value = false
  satId.value = null
  fetchInbox()

}

const searchQuery = ref()

const findHandler = () => {
  args.find = searchQuery.value
}

const clearHandler = () => {
  args.find = ''
}

const paginationData = computed(() => {
  return `Showing ${meta.from} to ${meta.to} of ${meta.total}`
})
</script>

<template>
  <VMain>
    <NotifSat
      v-if="isNotif"
      :sat-id="satId"
      @close="getClosed"
      @route-close="getClosed"
    />
    <VOverlay v-model="showLoading" />
    <VCard
      flat
      :loading="showLoading"
      class="h-100 d-flex flex-column"
    >
      <div class="py-2 px-5 d-flex items-center">
        <VTextField
          v-model="searchQuery"
          class="px-1 flex-grow-1"
          prepend-inner-icon="tabler-search"
          label="Search inbox"
          clearaable
          @keyup.enter="findHandler"
          @click:clear="clearHandler"
        />

        <VCheckbox v-model="checkedAll" />

        <VBtn
          variant="text"
          color="default"
          icon
          size="small"
          @click="fetchInbox"
        >
          <VIcon
            size="22"
            icon="tabler-reload"
          />
        </VBtn>
        <VBtn
          variant="text"
          color="default"
          icon
          size="small"
        >
          <VIcon
            size="22"
            icon="tabler-dots-vertical"
          />
        </VBtn>
      </div>
      <VDivider />
      <ul>
        <template
          v-for="(data, index) in inbox"
          :key="data.id"
        >
          <li 
            :class="{ 'unread': data.status === 0 }" 
            class="inbox-item d-flex align-center py-2 px-5 cursor-pointer"
            @click="markAsRead(data.job_order_task_id ?? data.ticket_id)"
          >
            <VCheckbox
              v-model="checked"
              :value="data.id"
              class="flex-shrink-0"
            />
            <h6 class="mx-2 text-body-1 font-weight-medium text-high-emphasis">
              {{ data.ticket_id ? data.ticket.user.person.name : data.processed_by_sat }} -
            </h6>
            <span class="truncate">
              {{ data.ticket_id ? `${data.message} (${data.ticket_number})` : `${data.status_sat} (${data.sat_number})` }}
            </span>
            <VSpacer />
            <span class="text-sm text-muted">{{ data.created_at }}</span>
            <div class="inbox-actions d-none">
              <VBtn
                variant="text"
                color="default"
                icon
                size="small"
              >
                <VIcon
                  size="22"
                  icon="tabler-trash"
                />
              </VBtn>
            </div>
          </li>
          <!-- Tambahkan VDivider setelah setiap item kecuali yang terakhir -->
          <VDivider
            v-if="index !== inbox.length - 1"
            :key="'divider-' + data.id"
          />
        </template>
      </ul>

      <VCardText class="d-flex align-center flex-wrap justify-space-between gap-4 py-3 px-5">
        <span class="text-sm text-disabled">{{ paginationData }}</span>
        <VPagination
          v-model="argspage"
          variant="outlined"
          rounded="circle"
          size="small"
          :total-visible="5"
          :length="meta.last"
        />
      </VCardText>
    </VCard>
  </VMain>
</template>

<style lang="scss">
@use "@styles/variables/_vuetify.scss";
@use "@core/scss/base/_mixins.scss";
@use "vuetify/lib/styles/tools/elevation" as elevation;

.field-search {
  .v-field__control {
    border-bottom: 2px solid #ccc;
  }
}

.inbox-item:hover {
  transform: translateY(-2px);
  @include elevation.elevation(3);

  .inbox-actions {
    display: block !important;
  }
  .inbox-meta {
    display: none;
  }
  + .inbox-item {
    border-color: transparent;
  }
}

.unread {
  background-color: #f0f0f0;
}
</style>

<route lang="yaml">
meta:
  action: Read
  subject: Dashboard
  redirectIfLoggedIn: false
</route>
