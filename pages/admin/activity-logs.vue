<template>
  <div>
    <!-- SIDEBAR -->
    <AdminSideBarPanel />

    <!-- MAIN CONTENT -->
    <div class="p-6 sm:ml-64">
      <h1 class="text-2xl font-bold mb-4">
        Activity Logs
      </h1>

      <div class="overflow-x-auto bg-white border rounded shadow-sm">
        <table class="w-full text-sm">
          <thead class="bg-gray-100 text-xs uppercase">
            <tr>
              <th class="px-3 py-2 text-left">Date & Time</th>
              <th class="px-3 py-2 text-left">Action</th>
              <th class="px-3 py-2 text-left">Entity</th>
              <th class="px-3 py-2 text-left">Description</th>
              <th class="px-3 py-2 text-right">Amount</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="log in logs"
              :key="log.id"
              class="border-b hover:bg-gray-50"
            >
              <td class="px-3 py-2">
                {{ formatDate(log.created_at) }}
              </td>

              <td class="px-3 py-2 capitalize font-medium">
                {{ log.action }}
              </td>

              <td class="px-3 py-2 capitalize">
                {{ log.entity }}
              </td>

              <td class="px-3 py-2">
                {{ log.description }}
              </td>

              <td class="px-3 py-2 text-right">
                <span v-if="log.amount !== null && log.amount !== undefined">
                  ₱{{ formatCurrency(log.amount) }}
                </span>
                <span v-else class="text-gray-400">—</span>
              </td>
            </tr>

            <!-- EMPTY STATE -->
            <tr v-if="!logs.length">
              <td colspan="5" class="px-4 py-6 text-center text-gray-500">
                No activity logs found
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { formatCurrency, formatDate } from '@/utils/formatters'
import AdminSideBarPanel from '~/components/Admin/AdminSideBarPanel.vue'
import { useSupabaseClient } from '#imports'

export default {
  components: { AdminSideBarPanel },

  data() {
    return {
      logs: []
    }
  },

  async mounted() {
    await this.loadLogs()
  },

 methods: {
  async loadLogs() {
    const supabase = useSupabaseClient()

    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Failed to load activity logs', error)
      return
    }

    this.logs = data || []
  }
}

}
</script>
