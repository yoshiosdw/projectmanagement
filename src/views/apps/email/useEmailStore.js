import axiosIns from '@/plugins/axios'
import { defineStore } from 'pinia'

export const useEmailStore = defineStore('email', {
  state: () => ({
    emails: [],
    emailsMeta: {
      draft: 0,
      inbox: 0,
      spam: 0,
    },
  }),
  // actions: {
  //   async fetchEmails() {
  //     try {
  //       const response = await axiosIns.get('/notifications/inbox')
        
  //       this.emails = response.data.data
  //     } catch (error) {
  //       console.error('Error fetching emails:', error)
  //     }
  //   },
  // },
})
