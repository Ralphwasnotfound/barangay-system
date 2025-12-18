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
                              {{ formatNameParts(family) }}
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

