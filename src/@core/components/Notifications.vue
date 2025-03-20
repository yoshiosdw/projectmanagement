<script setup>
import notificationImage from '@/assets/images/illustrations/congo-illustration.png'
import axiosIns from '@/plugins/axios'
import ability from '@/plugins/casl/ability'
import { useNotificationsStore } from '@/store/notificationStore'
import { computed, defineProps, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { formatDateMySql } from '../utils/formatters'

const props = defineProps({
  badgeProps: {
    type: Object,
    default: () => ({}),
  },
  location: {
    type: String,
    default: 'bottom end',
  },
})

const notificationsStore = useNotificationsStore()
const notifdata = ref([])
const loading = ref(false)
const router = useRouter()

const getNotifications = computed(() => {
  return notificationsStore.notifications
})

const handleClick = () => {
  fetchNotifications()
}

const userData = JSON.parse(localStorage.getItem('sinarjoUserData'))

const fetchNotifications = async () => {
  loading.value = true
  try {
    const response = await axiosIns.get('/notifications/inbox' )

    const notifications = response.data.data

    if (!userData) {
      notifdata.value = []
      notificationsStore.setNotifications([])
      
      return
    }

    const { role, id: userId } = userData

    const filteredNotifications = notifications.filter(notification => {
      if (role === 'ICT Staff' || role === 'administrator') {
        if (ability.can('Manage', 'ICT Ticket') && notification.message === 'Assign To Me') {
          return notification.person_in_charge_id === userId
        }
        if (ability.can('Approver', 'ICT Ticket') && notification.message === 'New Ticket') {
          return true
        }
      }
      
      return false
    })

    notifdata.value = filteredNotifications
    notificationsStore.setNotifications(filteredNotifications)
  } catch (error) {
    console.error('Error fetching notifications:', error)
  } finally {
    loading.value = false
  }
}

const markAsRead = async notificationId => {
  try {
    const notification = notifdata.value.find(n => n.id === notificationId)
    if (notification.message === 'New Ticket' && notification.ticket_id) {
      await router.push({ path: `/ticket/id/${notification.ticket_id}` })
    }
    if (notification.message === 'Assign To Me' && notification.ticket_id) {
      await router.push({ path: `/ticket/assignto/${notification.ticket_id}` })
    }
    await axiosIns.delete(`/notification/deletedBy/${notificationId}` )
    fetchNotifications()
  } catch (error) {
    console.error(error)
  }
}

const markAllAsRead = async () => {
  try {
    const messagesToDelete = []

    notifdata.value.forEach(notification => {
      messagesToDelete.push(notification.id)
    })
    await axiosIns.post('/notifications/deleteAll', { message_type: messagesToDelete } )
    fetchNotifications()
  } catch (error) {
    console.error(error)
  }
}

onMounted(() => {
  fetchNotifications()
})
</script>

<template>
  <VBtn
    icon
    variant="text"
    color="default"
    size="small"
    @click="handleClick"
  >
    <VBadge
      :model-value="badgeProps.content"
      color="error"
      :content="badgeProps.content"
    >
      <VIcon
        icon="tabler-bell"
        size="24"
      />
    </VBadge>

    <VMenu
      activator="parent"
      width="380px"
      :location="props.location"
      offset="14px"
      :menu-props="{ maxHeight: '10px' }"
    >
      <VList class="py-0">
        <!-- 👉 Header -->
        <VListItem
          title="Notifications"
          class="notification-section"
          height="48px"
        >
          <template #append>
            <VChip
              v-if="getNotifications.length"
              color="primary"
              size="small"
            >
              {{ getNotifications.length }} New
            </VChip>
          </template>
        </VListItem>

        <VDivider />

        <!-- 👉 Notifications list -->
        <div class="notification-list">
          <template
            v-for="notification in notifdata"
            :key="notification.id"
          >
            <VListItem
              :title="`${notification.message} - ${notification.ticket_number}`"
              :subtitle="notification.department"
              link
              lines="one"
              min-height="66px"
              :style="{
                backgroundColor: 'transparent',
                color: 'inherit'
              }"
              @click="markAsRead(notification.id)"
            >
              <!-- Slot: Prepend -->
              <template #prepend>
                <VListItemAction start>
                  <VAvatar
                    :color="notification.color || 'primary'"
                    :image="notificationImage || undefined"
                    :icon="notification.icon || undefined"
                    size="40"
                    variant="tonal"
                  />
                </VListItemAction>
              </template>
              <!-- Slot: Append -->
              <template #append>
                <small
                  class="whitespace-no-wrap"
                  :style="{ color: 'inherit' }"
                >
                  {{ formatDateMySql(notification.created_at) }}
                </small>
              </template>
            </VListItem>
            <VDivider />
          </template>
        </div>

        <!-- 👉 Footer -->
        <VListItem class="notification-section">
          <VBtn
            block
            @click="markAllAsRead"
          >
            READ ALL NOTIFICATIONS
          </VBtn>
        </VListItem>
      </VList>
    </VMenu>
  </VBtn>
</template>

<style lang="scss">
.notification-section {
  padding: 14px !important;
}

.v-list-item {
  color: inherit; /* This ensures the color property is set to inherit */
}

.notification-list {
  max-height: 300px; /* Set a maximum height for the scrollable area */
  overflow-y: auto; /* Enable vertical scrolling */
  overflow-x: hidden; /* Hide horizontal scrolling if not needed */
}
</style>
