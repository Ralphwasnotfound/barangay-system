<template>
      <div class="">
        <div class="p-3 sm:p-4">
          <div class="relative overflow-x-auto rounded-lg border border-gray-200 shadow-sm bg-white">
            <table class="min-w-[640px] w-full text-sm text-left text-gray-700">
              <thead class="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th class="px-4 sm:px-6 py-3 font-medium">Head of the Family</th>
                  <th class="px-4 sm:px-6 py-3 font-medium">Total Payment</th>
                  <th class="px-4 sm:px-6 py-3 font-medium">Address</th>
                </tr>
              </thead>

              <tbody>
                <tr
                  v-for="family in families"
                  :key="family.id"
                  @click="openReceiptModal(family)"
                  class="border-b border-gray-200
                         hover:bg-gray-100 active:bg-gray-200
                         cursor-pointer transition"
                >
                  <th class="px-4 sm:px-6 py-3 sm:py-4 font-medium text-gray-900 whitespace-nowrap">
                    {{ family.head_name }}
                  </th>

                  <td class="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                    ₱{{ family.total_payment }}.00
                  </td>

                  <td class="px-4 sm:px-6 py-3 sm:py-4 min-w-[220px]">
                    {{ family.address }}
                  </td>
                </tr>

                <tr v-if="!loading && families.length === 0">
                  <td colspan="3" class="px-6 py-6 text-center text-gray-500">
                    No records found
                  </td>
                </tr>
              </tbody>
            </table>

          </div>
        </div>

        <ReceiptModal
          v-if="showReceiptModal"
          :family="selectedFamily"
          @close="showReceiptModal = false"
          :readonly="true"
        />
      </div>
</template>

<script>
import ReceiptModal from '~/components/Modals/ReceiptModal.vue';

    export default {
        components: {
            ReceiptModal
        },
        data() {
            return {
                showReceiptModal: false,
                selectedFamily: null,

                families: [],
                loading: true,
                error: null
            }
        },
        async mounted() {
            await this.fetchFamilies()
        },
        methods: {
            async fetchFamilies() {
              this.$loading.show('Loading Data, Please wait...')

              try {
                const supabase = useSupabaseClient()

                const { data, error } = await supabase
                    .from('families')

                    .select(`
                    id,
                    head_name,
                    address,
                    payments (
                        amount
                    )
                `)

                if (error) {
                    this.error = error.message
                    console.error(error)
                    return
                }
                // Compute Total Payment per family
                this.families = data.map(f => ({
                    id: f.id,
                    head_name: f.head_name,
                    address: f.address,
                    total_payment: f.payments.reduce(
                        (sum, p) => sum + Number(p.amount),
                        0
                    )
                }))
              } finally {
                this.loading = false
                this.$loading.hide()
              } 
            },
            openReceiptModal(family) {
                this.selectedFamily = family
                this.showReceiptModal = true
            }
        }
    }
</script>

<style lang="scss" scoped>

</style>

