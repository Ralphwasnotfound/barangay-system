<template>
    <div>
      <AdminSideBarPanel />
        <div class="p-4 sm:ml-64">
            <div class="flex flex-col gap-3 mb-4 sm:flex-row sm:items-center sm:justify-between">
              <h1 class="text-lg font-semibold text-gray-900">Families</h1>
              <div class="flex items-center gap-2">
                <div 
                ref="searchWrapper"
                class="relative w-full sm:w-[350px]">
                  <SearchBar
                  :model-value="search" 
                  @search="handleSearch" 
                  />

                  <div
                    v-if="showSearchResults"
                    class="absolute z-50 mt-1 w-full bg-white border rounded-lg shadow-lg max-h-64 overflow-y-auto">
                    <div v-if="searching" class="p-3 text-sm text-gray-500">
                      Searching...
                    </div>

                    <div
                      v-for="family in searchResults"
                      :key="family.id"
                      class="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      @click="selectedSearchResult(family)"
                    >

                    <p class="font-medium text-gray-800">
                      {{ family.head_name }}
                    </p>

                    <p class="font-medium text-gray-800">
                      {{ family.address }}
                    </p>

                    </div>
                  </div>
                </div>
                <div 
                v-if="showResultInfo"
                class="flex items-center gap-2 px-3 py-1 rounded-md
                      bg-gray-100 border text-xs text-gray-700"
                >
                  <span class="font-medium">Results</span>
                  <span class="text-gray-400">•</span>
                  <span class="font-semibold">
                    {{ resultCount }} item{{ resultCount === 1 ? '' : 's' }}
                  </span>
                </div>
              </div>

              <input type="file"
              accept=".xlsx,.xls"
              @change="handleExcelUpload"
              class="hidden"
              ref="excelInput"
              >

              <button
                @click="$refs.excelInput.click()"
                class="bg-green-600 flex items-center gap-2 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700"
                >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="rgba(255,255,255,1)"><path d="M22 4C22 3.44772 21.5523 3 21 3H3C2.44772 3 2 3.44772 2 4V20C2 20.5523 2.44772 21 3 21H21C21.5523 21 22 20.5523 22 20V4ZM4 15H7.41604C8.1876 16.7659 9.94968 18 12 18C14.0503 18 15.8124 16.7659 16.584 15H20V19H4V15ZM4 5H20V13H15C15 14.6569 13.6569 16 12 16C10.3431 16 9 14.6569 9 13H4V5ZM16 9H13V6H11V9H8L12 13.5L16 9Z"></path></svg>
                Import Excel
              </button>

              <button
                @click="showAddFamilyModal = true"
                class="bg-blue-600 text-white px-4 py-2 rounded-lg
                text-sm hover:bg-blue-700 flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="rgba(255,255,255,1)"><path d="M14 14.252V16.3414C13.3744 16.1203 12.7013 16 12 16C8.68629 16 6 18.6863 6 22H4C4 17.5817 7.58172 14 12 14C12.6906 14 13.3608 14.0875 14 14.252ZM12 13C8.685 13 6 10.315 6 7C6 3.685 8.685 1 12 1C15.315 1 18 3.685 18 7C18 10.315 15.315 13 12 13ZM12 11C14.21 11 16 9.21 16 7C16 4.79 14.21 3 12 3C9.79 3 8 4.79 8 7C8 9.21 9.79 11 12 11ZM18 17V14H20V17H23V19H20V22H18V19H15V17H18Z"></path></svg>
                Add Head of the Family
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
                              {{ formatNameParts(family) }}
                          </th>
                          <td class="px-6 py-4">
                              ₱{{ family.total_payment }}.00
                          </td>
                          <td class="px-6 py-4">
                              {{ family.address }}
                          </td>
                          <td class="px-6 py-4 grid grid-cols-4">
                            <button 
                            title="Add Family Member"
                            @click.stop="openAddMemberModal(family)"
                            class="text-green-600 hover:underline text-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="rgba(100,205,138,1)"><path d="M14 14.252V22H4C4 17.5817 7.58172 14 12 14C12.6906 14 13.3608 14.0875 14 14.252ZM12 13C8.685 13 6 10.315 6 7C6 3.685 8.685 1 12 1C15.315 1 18 3.685 18 7C18 10.315 15.315 13 12 13ZM18 17V14H20V17H23V19H20V22H18V19H15V17H18Z"></path></svg>
                            </button>
                            <button
                            title="Add Payment"
                            @click.stop="openAddPaymentModal(family)"
                            class="text-blue-600 hover:underline text-sm">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="rgba(70,146,221,1)"><path d="M9.3349 11.5023L11.5049 11.5028C13.9902 11.5028 16.0049 13.5175 16.0049 16.0028H9.00388L9.00488 17.0028L17.0049 17.002V16.0028C17.0049 14.9204 16.6867 13.8997 16.1188 13.002L19.0049 13.0028C20.9972 13.0028 22.7173 14.1681 23.521 15.8542C21.1562 18.9748 17.3268 21.0028 13.0049 21.0028C10.2436 21.0028 7.90445 20.4122 6.00456 19.378L6.00592 10.0738C7.25147 10.2522 8.39122 10.7585 9.3349 11.5023ZM5.00488 19.0028C5.00488 19.5551 4.55717 20.0028 4.00488 20.0028H2.00488C1.4526 20.0028 1.00488 19.5551 1.00488 19.0028V10.0028C1.00488 9.45052 1.4526 9.00281 2.00488 9.00281H4.00488C4.55717 9.00281 5.00488 9.45052 5.00488 10.0028V19.0028ZM18.0049 5.00281C19.6617 5.00281 21.0049 6.34595 21.0049 8.00281C21.0049 9.65966 19.6617 11.0028 18.0049 11.0028C16.348 11.0028 15.0049 9.65966 15.0049 8.00281C15.0049 6.34595 16.348 5.00281 18.0049 5.00281ZM11.0049 2.00281C12.6617 2.00281 14.0049 3.34595 14.0049 5.00281C14.0049 6.65966 12.6617 8.00281 11.0049 8.00281C9.34803 8.00281 8.00488 6.65966 8.00488 5.00281C8.00488 3.34595 9.34803 2.00281 11.0049 2.00281Z"></path></svg>
                            </button>
                            <button
                            title="Edit a Family Member"
                            @click.stop="openEditFamilyModal(family)"
                            class="text-blue-500 hover:underline text-xs">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="rgba(70,146,221,1)"><path d="M12 14V22H4C4 17.5817 7.58172 14 12 14ZM12 13C8.685 13 6 10.315 6 7C6 3.685 8.685 1 12 1C15.315 1 18 3.685 18 7C18 10.315 15.315 13 12 13ZM14.5946 18.8115C14.5327 18.5511 14.5 18.2794 14.5 18C14.5 17.7207 14.5327 17.449 14.5945 17.1886L13.6029 16.6161L14.6029 14.884L15.5952 15.4569C15.9883 15.0851 16.4676 14.8034 17 14.6449V13.5H19V14.6449C19.5324 14.8034 20.0116 15.0851 20.4047 15.4569L21.3971 14.8839L22.3972 16.616L21.4055 17.1885C21.4673 17.449 21.5 17.7207 21.5 18C21.5 18.2793 21.4673 18.551 21.4055 18.8114L22.3972 19.3839L21.3972 21.116L20.4048 20.543C20.0117 20.9149 19.5325 21.1966 19.0001 21.355V22.5H17.0001V21.3551C16.4677 21.1967 15.9884 20.915 15.5953 20.5431L14.603 21.1161L13.6029 19.384L14.5946 18.8115ZM18 17C17.4477 17 17 17.4477 17 18C17 18.5523 17.4477 19 18 19C18.5523 19 19 18.5523 19 18C19 17.4477 18.5523 17 18 17Z"></path></svg>
                            </button>
                            <button
                            title="Delete Family"
                            v-if="family.canDelete"
                            @click.stop="confirmDeleteFamily(family)"
                            class="text-red-500 hover:underline text-xs">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="rgba(206,22,22,1)"><path d="M14 14.252V22H4C4 17.5817 7.58172 14 12 14C12.6906 14 13.3608 14.0875 14 14.252ZM12 13C8.685 13 6 10.315 6 7C6 3.685 8.685 1 12 1C15.315 1 18 3.685 18 7C18 10.315 15.315 13 12 13ZM19 16.5858L21.1213 14.4645L22.5355 15.8787L20.4142 18L22.5355 20.1213L21.1213 21.5355L19 19.4142L16.8787 21.5355L15.4645 20.1213L17.5858 18L15.4645 15.8787L16.8787 14.4645L19 16.5858Z"></path></svg>
                            </button>
                            <span
                            v-else
                            class="text-gray-400 text-xs" title="Cannot Delete Family">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="rgba(173,184,194,1)"><path d="M14 14.252V22H4C4 17.5817 7.58172 14 12 14C12.6906 14 13.3608 14.0875 14 14.252ZM12 13C8.685 13 6 10.315 6 7C6 3.685 8.685 1 12 1C15.315 1 18 3.685 18 7C18 10.315 15.315 13 12 13ZM19 16.5858L21.1213 14.4645L22.5355 15.8787L20.4142 18L22.5355 20.1213L21.1213 21.5355L19 19.4142L16.8787 21.5355L15.4645 20.1213L17.5858 18L15.4645 15.8787L16.8787 14.4645L19 16.5858Z"></path></svg>
                            </span>
                          </td>
                      </tr>
                      <tr v-if="!loading && families.length === 0">
    <td colspan="4" class="px-6 py-6 text-center text-gray-500">
      No records found
    </td>
  </tr>
                  </tbody>
              </table>
            </div>
          <PaginationGlobal
            :page="page"
            :total-pages="totalPages"
            @update:page="page = $event"
          />
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
import { useRoute, useRouter } from '#app'
import AdminSideBarPanel from '~/components/Admin/AdminSideBarPanel.vue';
import RecieptModal from '~/components/Modals/ReceiptModal.vue';
import AddFamilyModal from '~/components/Modals/AddFamilyModal.vue'
import AddMembersModal from '~/components/Modals/AddMembersModal.vue'
import AddPaymentModal from '~/components/Modals/AddPaymentModal.vue'
import EditFamilyModal from '~/components/Modals/EditFamilyModal.vue';
import DeleteModal from '~/components/Modals/DeleteModal.vue';
import PaginationGlobal from '~/components/Others/PaginationGlobal.vue';
import SearchBar from '~/components/Others/SearchBar.vue';

    export default {
      components: {
        AdminSideBarPanel,
        RecieptModal,
        AddFamilyModal,
        AddMembersModal,
        AddPaymentModal,
        EditFamilyModal,
        DeleteModal,
        PaginationGlobal,
        SearchBar
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
          showDeleteFamilyConfirm: false,
          // Pagination
          page: 1,
          pageSize: 10, 
          totalPages: 1,
          search: '',

          router: null,
          route: null,

          showSearchResults: false,
          searchResults: [],
          searching: false,

          resultCount: 0,
          showResultInfo: false,
          tableTimer: null
        }
      },
      async mounted() {
        this.route = useRoute()
        this.router = useRouter()

        this.page = Number(this.route.query.page) || 1
        this.search = this.route.query.q || ''

        this.sortBy = this.route.query.sort || 'head_name'
        this.sortDir = this.route.query.dir || 'asc'

        document.addEventListener('click', this.handleClickOutside)

        await this.fetchFamilies()
      },
      beforeUnmount() {
        document.removeEventListener('click', this.handleClickOutside)
      },
      methods: {
        async fetchFamilies() {
          this.$loading.show('Loading Data, Please wait...')

          try{
            const supabase = useSupabaseClient()

            const from = (this.page - 1) * this.pageSize
            const to = from + this.pageSize - 1

            let query = supabase
              .from('families')
              .select(`
                id,
                first_name,
                middle_name,
                last_name,
                suffix,
                address,
                payments (
                  amount
                )
              `, {count: 'exact' })
              .order('last_name', { ascending: true })
              .order('first_name', { ascending: true })

              const normalized = this.normalizeSearch(this.search)

              if (normalized) {
                query = query.ilike('search_text', `%${normalized}%`)
              }

              const { data, error, count } = await query.range(from, to)

              if (error) throw error 

              this.totalPages = count
                ? Math.ceil(count / this.pageSize)
                : 1

                this.resultCount = count || 0
                this.showResultInfo = !!this.search

                if (this.page > this.totalPages) {
                  this.page = this.totalPages
                }

              this.families = data.map(f => ({
                id: f.id,
                first_name: f.first_name,
                middle_name: f.middle_name,
                last_name: f.last_name,
                suffix: f.suffix,
                address: f.address,
                total_payment: (f.payments || []).reduce(
                  (sum, p) => sum + Number(p.amount),
                  0
                ),
                canDelete: (f.payments || []).length === 0
            }))
          } catch (err) {
            console.error(err)
            this.$notify.error('Failed to load families')
          } finally {
            this.loading = false
            this.$loading.hide()
          }
        },
        handleSearch(query) {
          this.search = query.trim()
          this.page = 1

          if(!this.search) {
            this.showResultInfo = false
          }

          this.fetchSearchResults()

          clearTimeout(this.tableTimer)
          this.tableTimer = setTimeout(() => {
            this.router.replace({
              query: {
              ...this.route.query,
              page: 1,
              q: this.search || undefined
            }
          })
          this.fetchFamilies()
          }, 400)
          
        },
        normalizeSearch(value) {
          return value
            .toLowerCase()
            .replace(/\s+/g, '')
            .replace(/[^a-z0-9]/g, '')
        },
        openReceiptModal(family) {
            this.selectedFamily = family
            this.showReceiptModal = true
        },
        async fetchSearchResults() {
  if (!this.search) {
    this.showSearchResults = false
    this.searchResults = []
    return
  }

  this.searching = true
  const supabase = useSupabaseClient()

  const { data, error } = await supabase
    .from('families')
    .select(`
      id,
      first_name,
      middle_name,
      last_name,
      suffix,
      address
    `)
    .or(
      `first_name.ilike.%${this.search}%,middle_name.ilike.%${this.search}%,last_name.ilike.%${this.search}%`
    )
    .order('last_name', { ascending: true })
    .order('first_name', { ascending: true })
    .limit(5)

  this.searching = false

  if (error) {
    console.error('Search error:', error)
    this.searchResults = []
    this.showSearchResults = false
    return
  }

  // 🔑 format name once for dropdown
  this.searchResults = data.map(f => ({
    ...f,
    head_name: this.formatNameParts(f)
  }))

  this.showSearchResults = this.searchResults.length > 0
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

  this.$loading.show('Importing Excel file, please wait...')

  try {
    const supabase = useSupabaseClient()

    /* ===============================
       HELPERS
    =============================== */

    // normalize header keys
    const normalizeKey = key =>
      key.toString().trim().toLowerCase().replace(/[^a-z0-9]+/g, '_')

    // normalize names for matching
    const norm = v =>
      (v ?? '')
        .toString()
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '')
        .replace(/[^a-z0-9]/g, '')

    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer)

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

    const parseExcelDate = value => {
      if (!value) return null

      if (typeof value === 'number') {
        const d = XLSX.SSF.parse_date_code(value)
        return `${d.y}-${String(d.m).padStart(2,'0')}-${String(d.d).padStart(2,'0')}`
      }

      const parsed = new Date(value)
      return isNaN(parsed) ? null : parsed.toISOString().split('T')[0]
    }

    /* ===============================
       READ SHEETS
    =============================== */
    const familiesSheet = getSheet('families')
    const membersSheet  = getSheet('members')
    const paymentsSheet = getSheet('payments')

    /* ===============================
       1️⃣ IMPORT FAMILIES
    =============================== */
    const familyMap = {}

    for (const row of familiesSheet) {
      const first_name  = row.first_name?.trim()
      const middle_name = row.middle_name?.trim() || null
      const last_name   = row.last_name?.trim()
      const suffix      = row.suffix?.trim() || null
      const address     = row.address?.trim() || null

      if (!first_name || !last_name) continue

      const { data, error } = await supabase
        .from('families')
        .upsert(
          { first_name, middle_name, last_name, suffix, address },
          { onConflict: 'first_name,middle_name,last_name,suffix' }
        )
        .select('id')
        .single()

      if (!error && data) {
        const key = `${norm(first_name)}|${norm(last_name)}`
        familyMap[key] = data.id
      }
    }

    /* ===============================
       2️⃣ IMPORT MEMBERS
    =============================== */
    const memberMap = {}

    for (const row of membersSheet) {
      const familyKey = `${norm(row.family_first_name)}|${norm(row.family_last_name)}`

      const familyId = familyMap[familyKey]
      if (!familyId) continue

      const first_name  = row.member_first_name?.trim()
      const middle_name = row.member_middle_name?.trim() || null
      const last_name   = row.member_last_name?.trim()
      const suffix      = row.member_suffix?.trim() || null

      if (!first_name || !last_name) continue

      const { data, error } = await supabase
        .from('members')
        .upsert(
          {
            family_id: familyId,
            first_name,
            middle_name,
            last_name,
            suffix
          },
          {
            onConflict: 'family_id,first_name,middle_name,last_name,suffix'
          }
        )
        .select('id, family_id')
        .single()

      if (!error && data) {
        const memberKey =
          `${norm(row.member_first_name)}||${norm(row.member_last_name)}|`

        memberMap[memberKey] = {
          id: data.id,
          family_id: familyId
        }
      }
    }

    /* ===============================
       3️⃣ IMPORT PAYMENTS
    =============================== */
    const duplicateReceipts = []

    for (const row of paymentsSheet) {
      const memberKey =
        `${norm(row.member_first_name)}||${norm(row.member_last_name)}|`

      const member = memberMap[memberKey]
      if (!member) continue

      const receipt = row.receipt_number
      const amount  = Number(row.amount)

      if (!receipt || !amount) continue

      const { data: existing } = await supabase
        .from('payments')
        .select('id')
        .eq('receipt_number', receipt)
        .maybeSingle()

      if (existing) {
        duplicateReceipts.push(receipt)
        continue
      }

      await supabase.from('payments').insert({
        family_id: member.family_id,
        member_id: member.id,
        amount,
        category: row.category,
        receipt_number: receipt,
        created_at: parseExcelDate(row.date)
      })
    }

    /* ===============================
       RESULT
    =============================== */
    if (duplicateReceipts.length) {
      this.$notify.error(
        `⚠️ Import failed.\n\nDuplicate Receipt Numbers:\n${duplicateReceipts.join(', ')}`
      )
    } else {
      this.$notify.success('✅ Excel import completed successfully!')
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
        },
        handleClickOutside(e) {
          if (!this.$refs.searchWrapper?.contains(e.target)) {
            this.showSearchResults = false
          }
        },
        selectedSearchResult(family) {
          this.search = family.head_name

          this.showSearchResults = false
          this.searchResults = []
          
          this.page = 1

          this.router.replace({
            query: {
              ...this.route.query,
              page: 1,
              q: this.search
            }
          })

          this.fetchFamilies()

          this.$nextTick(() => {
            const table = document.querySelector('table')
            table?.scrollIntoView({ behavior: 'smooth', block: 'start'})
          })
        },
        formatNameParts(f) {
          if (!f?.last_name || !f?.first_name) return ''
                
          const first = f.first_name.trim()
          const middle = f.middle_name?.trim()
          const last = f.last_name.trim()
          const suffix = f.suffix?.trim()
                
          // Middle initial ONLY if middle name is longer than 1 char
          const middleInitial =
            middle && middle.length > 1
              ? middle.charAt(0).toUpperCase() + '.'
              : ''
                
          return [
            `${last},`,
            first,
            middleInitial,
            suffix
          ].filter(Boolean).join(' ')
        }
      },
      watch: {
        page(newPage) {
          if (Number(this.route.query.page) !== newPage) {
            this.router.replace({
              query: {
                ...this.route.query,
                page: newPage
              }
            })
          }
          this.fetchFamilies()
        }
      }
    }
</script>

<style lang="scss" scoped>

</style>

