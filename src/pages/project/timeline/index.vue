<script setup>
import { ref, onMounted, nextTick, watch, computed } from 'vue'
import axiosIns from '@/plugins/axios'
import { useToast } from 'vue-toastification'
import { formatDateMySql } from '@/@core/utils/formatters'

const headers = ref([])
const openGroups = ref([])
const showLoading = ref(false)
const gantt = ref(null)
const currentViewMode = ref('Month')

const toast = useToast()

const currentYear = new Date().getFullYear()
const years = ref([currentYear, currentYear - 1, currentYear - 2, currentYear - 3])
const selectedYear = ref(currentYear) // Default ke tahun saat ini

const formatDate = date => {
  const d = new Date(date)
  if (isNaN(d.getTime())) return '2023-01-01' // Default fallback jika tanggal tidak valid

  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const fetchProject = async () => {
  showLoading.value = true
  try {
    const { data } = await axiosIns.get('/projects', {
      params: {
        year: selectedYear.value, // Kirim tahun yang dipilih
      },
    })

    headers.value = data.data
  } catch (err) {
    toast.error('Failed to load project data')
  } finally {
    showLoading.value = false
  }
}

const getCustomClassByStatus = status => {
  if (status === 2) return 'bar-status-2'
  if (status === 3) return 'bar-status-3'
  
  return 'bar-status-other'
}

const isValidDateRange = (start, end) => {
  return start <= end
}

const createTaskObject = ({ id, name, start, end, progress, customClass }) => {
  return {
    id,
    name,
    start: formatDate(start),
    end: formatDate(end),
    progress: progress || 0,
    dependencies: '',
    custom_class: customClass,
  }
}

const generateTasksFromHeader = () => {
  const tasks = []

  headers.value.forEach(item => {
    const start = new Date(formatDate(item.plan_start))
    const end = new Date(formatDate(item.plan_end))
    const customClass = getCustomClassByStatus(item.status)

    if (isValidDateRange(start, end)) {
      tasks.push(
        createTaskObject({
          id: `h-${item.id}`,
          name: item.name,
          start,
          end,
          progress: item.progress,
          customClass,
        }),
      )
    } else {
      console.warn(`Invalid project date range (header): ${item.name}`, {
        start: item.plan_start,
        end: item.plan_end,
      })
    }

    if (openGroups.value.includes(item.name) && Array.isArray(item.line)) {
      item.line.forEach(line => {
        const lineStart = new Date(formatDate(line.plan_start))
        const lineEnd = new Date(formatDate(line.plan_end))
        const lineClass = getCustomClassByStatus(line.status)

        if (isValidDateRange(lineStart, lineEnd)) {
          tasks.push(
            createTaskObject({
              id: `l-${line.id}`,
              name: `- ${line.description}`,
              start: lineStart,
              end: lineEnd,
              progress: line.progress,
              customClass: lineClass,
            }),
          )
        } else {
          console.warn(`Invalid line date range: ${line.description}`, {
            start: line.plan_start,
            end: line.plan_end,
          })
        }
      })
    }
  })

  return tasks
}


const renderGanttChart = async () => {
  await nextTick()

  const tasks = generateTasksFromHeader()

  if (typeof Gantt === 'undefined') {
    console.error('Frappe Gantt is not loaded')
    
    return
  }

  document.getElementById('gantt-container').innerHTML = ''

  gantt.value = new Gantt('#gantt-container', tasks, {
    header_height: 50,
    column_width: 100,
    step: 24,
    view_modes: ['Day', 'Week', 'Month'],
    bar_height: 22,
    bar_corner_radius: 3,
    arrow_curve: 5,
    padding: 18,
    view_mode: currentViewMode.value,
    date_format: 'YYYY-MM-DD',

    //send to backend
    on_date_change: async (task, start, end) => {
      const isHeader = task.id.startsWith('h-')
      const isLine = task.id.startsWith('l-')
      const cleanId = task.id.replace(/^h-/, '').replace(/^l-/, '')

      console.log('Updating:', {
        id: cleanId,
        type: isHeader ? 'project' : 'line',
        start,
        end,
      })

      try {
        if (isHeader) {
          const response = await axiosIns.post(`/projects/${cleanId}`, {
            plan_start: formatDateMySql(start),
            plan_end: formatDateMySql(end),
          })

          console.log('Project updated:', response.data)
        } else if (isLine) {
          const response = await axiosIns.patch(`/project/line/${cleanId}`, {
            plan_start: formatDateMySql(start),
            plan_end: formatDateMySql(end),
          })

          console.log('Line updated:', response.data)
        }

        toast.success(`Updated: ${task.name}`)
      } catch (err) {
        console.error('Failed to update:', err)
        toast.error(`Failed to update ${task.name}`)
      }
    },

  })
  

  // Tambah tahun ke label bulan
  setTimeout(() => {
    const monthLabels = document.querySelectorAll('.grid-header .tick text')

    monthLabels.forEach(label => {
      if (!label.__data__) return
      const monthText = label.textContent
      const date = new Date(label.__data__)
      const year = date.getFullYear()
      if (monthText && !monthText.includes(year)) {
        label.textContent = `${monthText} ${year}`
      }
    })
  }, 100)
}

watch(openGroups, renderGanttChart)
watch(currentViewMode, renderGanttChart)

const scrollToCurrentMonth = () => {
  const scrollContainer = document.getElementById('main-scroll-container')
  if (!scrollContainer) return

  const today = new Date()
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  const ganttStart = new Date(today.getFullYear(), 0, 1)
  const daysFromStart = Math.floor((firstOfMonth - ganttStart) / (1000 * 60 * 60 * 24))

  const columnWidth = 100

  scrollContainer.scrollLeft = daysFromStart * columnWidth
}

onMounted(() => {
  fetchProject().then(() => {
    if (typeof Gantt !== 'undefined') {
      renderGanttChart()
      scrollToCurrentMonth()
    }
  })
})
</script>

<template>
  <VCard style="height: 600px; display: flex; flex-direction: column;">
    <VOverlay v-model="showLoading" />

    <!-- Tombol mode -->
    <div style="padding: 8px; display: flex; align-items: center;">
      <VSelect
        v-model="selectedYear"
        :items="years"
        label="Filter by Year"
        variant="outlined"
        density="compact"
        style="max-width: 150px; margin-right: 16px;"
        @update:model-value="fetchProject"
      />
  
      <VBtnToggle
        v-model="currentViewMode"
        divided
      >
        <VBtn
          value="Day"
          variant="outlined"
          color="primary"
        >
          Day
        </VBtn>
        <VBtn
          value="Week"
          variant="outlined"
          color="primary"
        >
          Week
        </VBtn>
        <VBtn
          value="Month"
          variant="outlined"
          color="primary"
        >
          Month
        </VBtn>
      </VBtnToggle>
    </div>

    <!-- Wrapper Scroll Tunggal -->
    <div
      id="main-scroll-container"
      style="flex: 1; overflow: auto;"
    >
      <div style="display: flex; min-width: max-content;">
        <!-- Panel Kiri (Sticky) -->
        <div
          style="
            width: 300px;
            position: sticky;
            left: 0;
            top: 0;
            background: white;
            z-index: 10;
            border-right: 1px solid #ccc;
          "
        >
          <div style="padding: 16px; font-weight: bold;">
            Project List
          </div>
          <VDivider />
          <VList
            v-model:opened="openGroups"
            density="compact"
          >
            <template
              v-for="(item, index) in headers"
              :key="index"
            >
              <VListGroup
                :value="item.name"
                prepend-icon="mdi-dot"
              >
                <template #activator="{ props }">
                  <VListItem
                    v-bind="props"
                    :title="item.name"
                  />
                </template>
                <VListItem
                  v-for="(line, idx) in item.line"
                  :key="idx"
                  :title="line.description"
                  prepend-icon="mdi-subdirectory-arrow-right"
                />
              </VListGroup>
            </template>
          </VList>
        </div>

        <!-- Panel Kanan -->
        <div style="flex: 1;">
          <div
            id="gantt-container"
            style="min-height: 600px;"
          />
        </div>
      </div>
    </div>
  </VCard>
</template>

<style>
.no-spinner input::-webkit-outer-spin-button,
.no-spinner input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.no-spinner input[type="text"] {
  -moz-appearance: textfield; /* For Firefox */
}

.bar-status-2 .bar {
  fill: #28C76F !important;
}

.bar-status-3 .bar {
  fill: #999999 !important;
}

.bar-status-other .bar {
  fill: #EA5455 !important;
}
</style>

<route lang="yaml">
meta:
  action: Read
  subject: Project
  redirectIfLoggedIn: false
</route>
