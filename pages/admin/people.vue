<template>
    <div>
        <AdminSideBarPanel />
        <div class="p-4 sm:ml-64">
            <div class="flex justify-between items-center mb-4">
                    <h1 class="text-lg font-semibold text-gray-900">
                        Families
                    </h1>

                    <input type="file"
                    accept=".xlsx,.xls"
                    @change="handleExcelUpload"
                    class="hidden"
                    ref="excelInput"
                    >

                    <button
                        @click="$refs.excelInput.click()"
                        class="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700"
                        >
                        Import Excel
                    </button>

                    <button
                        @click="showAddFamilyModal = true"
                        class="bg-blue-600 text-white px-4 py-2 rounded-lg
                        text-sm hover:bg-blue-700">
                        + Add Head of the Family
                    </button>
                </div>

            <div class="relative overflow-x-auto rounded-lg border border-gray-200 shadow-sm bg-white">
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

                                <div class="mt-2 space-x-3">
                                  <button
                                  @click.stop="openEditFamilyModal(family)"
                                  class="text-blue-500 hover:underline text-xs">
                                    Edit Family
                                  </button>

                                  <button
                                  v-if="family.canDelete"
                                  @click.stop="confirmDeleteFamily(family)"
                                  class="text-red-500 hover:underline text-xs">
                                    Delete Family
                                  </button>

                                  <span
                                  v-else
                                  class="text-gray-400 text-xs"
                                >
                                  Cannot delete family
                                  </span>
                                </div>
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
        :readonly="false"
        />

        <AddFamilyModal 
        v-if="showAddFamilyModal"
        @close="showAddFamilyModal = false"
        @saved="handleFamilySaved"
        />

        <AddMembersModal
        v-if="showAddMemberModal"
        :family="selectedFamily"
        @close="showAddMemberModal = false"
        @saved="HandleMemberSaved"
        />

        <AddPaymentModal 
        v-if="showAddPaymentModal"
        :family="selectedFamily"
        @close="showAddPaymentModal = false"
        @saved="handlePaymentSaved"
        />

        <EditFamilyModal
        v-if="showEditFamilyModal"
        :family="selectedFamily"
        @close="showEditFamilyModal = false"
        @saved="handleFamilyUpdated"
        />

        <DeleteModal
        v-if="showDeleteFamilyConfirm"
        title="Delete Family"
        message="Are you sure you want to delete this family? This action cannot be undone."
        @confirm="deleteFamily"
        @cancel="showDeleteFamilyConfirm = false"
        />
    </div>
</template>

<script>
import * as XLSX from 'xlsx'
import AdminSideBarPanel from '~/components/Admin/AdminSideBarPanel.vue';
import RecieptModal from '~/components/Modals/ReceiptModal.vue';
import AddFamilyModal from '~/components/Modals/AddFamilyModal.vue'
import AddMembersModal from '~/components/Modals/AddMembersModal.vue'
import AddPaymentModal from '~/components/Modals/AddPaymentModal.vue'
import EditFamilyModal from '~/components/Modals/EditFamilyModal.vue';
import DeleteModal from '~/components/Modals/DeleteModal.vue';

    export default {
      components: {
        AdminSideBarPanel,
        RecieptModal,
        AddFamilyModal,
        AddMembersModal,
        AddPaymentModal,
        EditFamilyModal,
        DeleteModal
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
          error: null,
          showEditFamilyModal: false,
          showDeleteFamilyConfirm: false
        }
      },
      async mounted() {
        await this.fetchFamilies()
      },
      methods: {
        async fetchFamilies() {
          this.$loading.show('Loading Data, Please wait...')

          try{
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
          
            this.families = data.map(f => ({
              id: f.id,
              head_name: f.head_name,
              address: f.address,
              total_payment: (f.payments || []).reduce(
                (sum, p) => sum + Number(p.amount),
                0
              ),

              canDelete: (f.payments || []).length === 0
            }))
          } finally {
            this.loading = false
            this.$loading.hide()
          }
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
        },
        async handleFamilySaved() {
          await this.fetchFamilies()
          this.$notify.success('Head of the Family addes successfully!')
        },
        async handlePaymentSaved() {
          await this.fetchFamilies()
          this.$notify.success('Payment added successfully!')
        },

        async HandleMemberSaved() {
          await this.fetchFamilies()
          this.$notify.success('Member added successfully!')
        },
        async handleExcelUpload(event) {
          const file = event.target.files[0]
          if (!file) return

          this.$loading.show('Importing Exel file, please wait...')

          try{
            const supabase = useSupabaseClient()
        
            const buffer = await file.arrayBuffer()
            const workbook = XLSX.read(buffer)
        
          /* -------------------------------
            🔑 NORMALIZE EXCEL HEADERS
            "MEMBER FULL NAME" → member_full_name
          -------------------------------- */
          const normalizeKey = key =>
            key
              .toString()
              .trim()
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '_')
              .replace(/^_|_$/g, '')
        
          const getSheet = name => {
            const sheet = workbook.Sheets[name]
            if (!sheet) return []
          
            const raw = XLSX.utils.sheet_to_json(sheet, { header: 1 })
            const headers = raw[0].map(normalizeKey)
          
            return raw.slice(1).map(row => {
              const obj = {}
              headers.forEach((h, i) => {
                obj[h] = row[i] ?? ''
              })
              return obj
            })
          }
          /* -------------------------------
            📅 EXCEL DATE → ISO (YYYY-MM-DD)
          -------------------------------- */
          const parseExcelDate = value => {
            if (!value) return null
          
            if (typeof value === 'number') {
              const d = XLSX.SSF.parse_date_code(value)
              return `${d.y}-${String(d.m).padStart(2,'0')}-${String(d.d).padStart(2,'0')}`
            }
          
            const parsed = new Date(value)
            if (!isNaN(parsed)) {
              return parsed.toISOString().split('T')[0]
            }
          
            return null
          }
        
          /* -------------------------------
             READ SHEETS
          -------------------------------- */
          const familiesSheet = getSheet('families')
          const membersSheet  = getSheet('members')
          const paymentsSheet = getSheet('payments')
        
          /* -------------------------------
             1️⃣ IMPORT FAMILIES
          -------------------------------- */
          const familyMap = {}
        
          for (const row of familiesSheet) {
            const head =
              row.head_of_the_family ||
              row.head_of_the_family_full_name ||
              row.head_name
          
            if (!head) continue
          
            const { data, error } = await supabase
              .from('families')
              .upsert(
                { head_name: head.trim(), address: row.address },
                { onConflict: 'head_name' }
              )
              .select('id, head_name')
              .single()
          
            if (!error) {
              familyMap[head.trim().toLowerCase()] = data.id
            }
          }
        
          /* -------------------------------
             2️⃣ IMPORT MEMBERS
          -------------------------------- */
          const memberMap = {}
        
          for (const row of membersSheet) {
            const familyHead =
              row.head_of_the_family ||
              row.family_head_name ||
              row.head_of_the_family_full_name
          
            const fullName = row.full_name || row.member_full_name
          
            if (!familyHead || !fullName) continue
          
            const familyId = familyMap[familyHead.trim().toLowerCase()]
            if (!familyId) continue
          
            const { data, error } = await supabase
              .from('members')
              .upsert(
                { family_id: familyId, full_name: fullName.trim() },
                { onConflict: 'family_id,full_name' }
              )
              .select('id, family_id, full_name')
              .single()
          
            if (!error) {
              memberMap[fullName.trim().toLowerCase()] = {
                id: data.id,
                family_id: data.family_id
              }
            }
          }
        
          /* -------------------------------
             3️⃣ IMPORT PAYMENTS (SAFE)
          -------------------------------- */
          let duplicateReceipts = []
          let hasErrors = false
        
          for (const row of paymentsSheet) {
            const memberName = row.member_full_name || row.full_name
            const receipt = row.receipt_number
            const amount = Number(row.amount)
          
            if (!memberName || !receipt || !amount) continue
          
            const member = memberMap[memberName.trim().toLowerCase()]
            if (!member) continue
          
            // 🔍 PREVENT DUPLICATE RECEIPT
            const { data: existing } = await supabase
              .from('payments')
              .select('id')
              .eq('receipt_number', receipt)
              .maybeSingle()
          
            if (existing) {
              duplicateReceipts.push(receipt)
              hasErrors = true
              continue
            }
          
            const paymentDate = parseExcelDate(row.date)
          
            const { error } = await supabase.from('payments').insert({
              family_id: member.family_id,
              member_id: member.id,
              amount,
              category: row.category,
              receipt_number: receipt,
              created_at: paymentDate
            })
          
            if (error) {
              hasErrors = true
            }
          }
        
          /* -------------------------------
            FINAL RESULT
          -------------------------------- */
          if (hasErrors) {
            this.$notify.error(
              'Duplicate Receipt Numbers:\n' +
              duplicateReceipts.join(', ')
            )
          } else {
            this.$notify.success('Exel import completed successfully!')
          }

          await this.fetchFamilies()

          } catch (err) {
            console.error(err)
            this.$notify.error('Failed to import Excel file.')
          } finally {
            this.$loading.hide()
          }
        },
        normalizeKey(key) {
          return key
          .toString()
          .trim()
          .toLowerCase()
          .replace(/\s+/g, '_')
          .replace(/[^a-z0-9_]/g, '')
        },
        openEditFamilyModal(family) {
          this.selectedFamily = { ...family}
          this.showEditFamilyModal = true
        },
        confirmDeleteFamily(family) {
          this.selectedFamily = family
          this.showDeleteFamilyConfirm = true
        },
        async handleFamilyUpdated() {
          await this.fetchFamilies()
          this.$notify.success('Family updated Successfully!')
        },
        async deleteFamily() {
          this.$loading.show('Deleting family...')

          try {
            const supabase = useSupabaseClient()

            if (!this.selectedFamily.canDelete) {
              this.$notify.error('Cannot delete family with payments or members')
              return
            }

            await supabase
              .from('families')
              .delete()
              .eq('id', this.selectedFamily.id)

            await this.fetchFamilies()
            this.$notify.success('Family deleted successfully')
          } catch (err) {
            console.error(err)
            this.$notify.error('Failed to delete family')
          } finally {
            this.showDeleteFamilyConfirm = false
            this.selectedFamily = null
            this.$loading.hide()
          }
        }
      }
    }
</script>

<style lang="scss" scoped>

</style>

