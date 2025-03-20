import ability from '@/plugins/casl/ability'
import { defineStore } from 'pinia'

export const useNotificationsStore = defineStore('notifications', {
  state: () => ({
    notifications: [],
  }),
  getters: {
    filteredNotifications(state) {
      const userData = JSON.parse(localStorage.getItem('sinarjoUserData'))
      if (!userData) return []

      const { role, id: userId } = userData

      return state.notifications.filter(notification => {
        if (role === 'ICT Staff') {
          if (ability.can('Manage', 'ICT Ticket') && notification.message === 'Assign To Me') {
            return notification.person_in_charge_id === userId && notification.status === 0
          }
          if (ability.can('Approver', 'ICT Ticket') && notification.message === 'New Ticket') {
            return notification.status === 0
          }
        }
        
        return false
      })
    },
    notificationsCount(state) {
      return this.filteredNotifications.length
    },
  },
  actions: {
    addNotification(notification) {
      this.notifications = [notification, ...this.notifications]
    },
    setNotifications(notifications) {
      this.notifications = notifications
    },
    clearNotifications() {
      this.notifications = []
    },
    removeNotification() {
      console.log('Before Removal:', this.notifications)

      if (this.notifications.length > 0) {
        this.notifications.splice(0, 1)
        console.log('After Removal:', this.notifications)
      } else {
        console.log('No notifications to remove')
      }
    },
  },
})
