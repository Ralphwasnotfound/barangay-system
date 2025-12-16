<template>
    <div>
        <AdminSideBarPanel />
        <div class="p-4 sm:ml-64">
            <div class="flex justify-between items-center mb-4">
                    <h1 class="text-lg font-semibold text-gray-900">
                        Families
                    </h1>

                    <button
                        @click="showAddFamilyModal = true"
                        class="bg-blue-600 text-white px-4 py-2 rounded-lg
                        text-sm hover:bg-blue-700">
                        + Add Head of the Family
                    </button>
                </div>

            <div class="relative overflow-x-auto rounded-lg border border-gray-200 shadow-sm bg-white">
                <p v-if="loading" class="p-4 text-gray-500">
                    Loading data...
                </p>

                <table class="w-full text-sm text-left text-gray-700">
                    <thead class="bg-gray-100 border-b border-gray-200">
                        <tr>
                            <th class="px-6 py-3 font-medium text-gray-700">Head of the Family</th>
                            <th class="px-6 py-3 font-medium text-gray-700">Total Payment</th>
                            <th class="px-6 py-3 font-medium text-gray-700">Address</th>
                            <th class="px-6 py-3 font-medium text-gray-700">Actions</th>
                        </tr>
                    </thead>
            
                    <tbody>
                        <tr
                        v-for="family in families"
                        :key="family.id"
                        @click="openReceiptModal(family)"
                        class="border-b border-gray-200 hover:bg-gray-100 cursor-pointer">
                            <th class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                {{ family.head_name }}
                            </th>
                            <td class="px-6 py-4">
                                ₱{{ family.total_payment }}.00
                            </td>
                            <td class="px-6 py-4">
                                {{ family.address }}
                            </td>
                            <td class="px-6 py-4">
                                <button 
                                @click.stop="openAddMemberModal(family)"
                                class="text-green-600 hover:underline text-sm">
                                    + AddMember
                                </button>

                                <button
                                @click.stop="openAddPaymentModal(family)"
                                class="text-blue-600 hover:underline text-sm"
                                >
                                    + Add Payment
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <RecieptModal
        v-if="showReceiptModal"
        :family="selectedFamily"
        @close="showReceiptModal = false"
        />

        <AddFamilyModal 
        v-if="showAddFamilyModal"
        @close="showAddFamilyModal = false"
        @saved="fetchFamilies"
        />

        <AddMembersModal
        v-if="showAddMemberModal"
        :family="selectedFamily"
        @close="showAddMemberModal = false"
        />

        <AddPaymentModal 
        v-if="showAddPaymentModal"
        :family="selectedFamily"
        @close="showAddPaymentModal = false"
        @saved="fetchFamilies"
        />

    </div>
</template>

<script>
import AdminSideBarPanel from '~/components/Admin/AdminSideBarPanel.vue';
import RecieptModal from '~/components/Modals/RecieptModal.vue';
import AddFamilyModal from '~/components/Modals/AddFamilyModal.vue'
import AddMembersModal from '~/components/Modals/AddMembersModal.vue'
import AddPaymentModal from '~/components/Modals/AddPaymentModal.vue'


    export default {
        components: {
            AdminSideBarPanel,
            RecieptModal,
            AddFamilyModal,
            AddMembersModal,
            AddPaymentModal
        },
        data() {
            return {
                showAddFamilyModal: false,
                showReceiptModal: false,
                showAddMemberModal: false,
                showAddPaymentModal: false,
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

                this.loading = false
            },
            openReceiptModal(family) {
                this.selectedFamily = family
                this.showReceiptModal = true
            },
            openAddMemberModal(family) {
                this.selectedFamily = family
                this.showAddMemberModal = true
            },
            openAddPaymentModal(family) {
                this.selectedFamily = family
                this.showAddPaymentModal = true
            }
        }
    }
</script>

<style lang="scss" scoped>

</style>

