<template>
  <div class="bg-gray-50 min-h-screen">
    <!-- SIDEBAR -->
    <AdminSideBarPanel />

    <!-- MAIN CONTENT -->
    <div class="p-4 sm:p-6 sm:ml-64 space-y-6">

      <!-- PAGE HEADER -->
      <div>
        <h1 class="text-2xl font-bold text-gray-900">
          Activity Logs
        </h1>
        <p class="text-sm text-gray-500">
          System actions and transaction history
        </p>
      </div>

      <!-- TABLE CARD -->
      <div class="bg-white border rounded-2xl shadow-sm overflow-hidden">

        <!-- TABLE WRAPPER -->
        <div class="overflow-x-auto">
          <table class="min-w-full text-sm text-left text-gray-700">

            <!-- HEADER -->
            <thead class="bg-gray-100 text-xs uppercase sticky top-0 z-10">
              <tr>
                <th class="px-4 py-3">Date & Time</th>
                <th class="px-4 py-3">Action</th>
                <th class="px-4 py-3">Entity</th>
                <th class="px-4 py-3">Description</th>
                <th class="px-4 py-3 text-right">Amount</th>
              </tr>
            </thead>

            <!-- BODY -->
            <tbody>
              <tr
                v-for="log in logs"
                :key="log.id"
                class="border-b hover:bg-gray-50 transition"
              >
                <td class="px-4 py-3 whitespace-nowrap">
                  {{ formatDate(log.created_at) }}
                </td>

                <td class="px-4 py-3">
                  <span
                    class="px-2 py-1 rounded text-xs font-semibold capitalize"
                    :class="{
                      'bg-green-100 text-green-700': log.action === 'create',
                      'bg-blue-100 text-blue-700': log.action === 'update',
                      'bg-red-100 text-red-700': log.action === 'delete',
                      'bg-gray-100 text-gray-700': !['create','update','delete'].includes(log.action)
                    }"
                  >
                    {{ log.action }}
                  </span>
                </td>

                <td class="px-4 py-3 capitalize">
                  {{ log.entity }}
                </td>

                <td class="px-4 py-3 max-w-[420px] truncate">
                  {{ log.description }}
                </td>

                <td class="px-4 py-3 text-right whitespace-nowrap">
                  <span v-if="log.amount !== null && log.amount !== undefined">
                    ₱{{ formatCurrency(log.amount) }}
                  </span>
                  <span v-else class="text-gray-400">—</span>
                </td>
              </tr>

              <!-- EMPTY STATE -->
              <tr v-if="!logs.length">
                <td colspan="5" class="px-6 py-10 text-center text-gray-500">
                  <div class="flex flex-col items-center gap-2">
                    <span class="text-4xl">📄</span>
                    <p class="font-medium">No activity logs found</p>
                    <p class="text-xs text-gray-400">
                      Actions will appear here once the system is used
                    </p>
                  </div>
                </td>
              </tr>

            </tbody>
          </table>
        </div>

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
