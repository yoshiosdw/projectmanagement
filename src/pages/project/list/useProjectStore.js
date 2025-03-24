import { defineStore } from "pinia";

export const useProject = defineStore("useProjectStore", {
  id: "useProjectStore",
  state: () => ({
    find: '',
    page: 1,
    perPage: 10,
    total: 0,
    last: 0,
    from: 1,
    to: 1,
  }),
});
