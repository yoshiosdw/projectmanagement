import { defineStore } from "pinia";

export const useJobOrder = defineStore("jobOrderStore", {
  id: "jobOrderStore",
  state: () => ({
    orders: null,
    find: '',
    pic: null
  }),
});
