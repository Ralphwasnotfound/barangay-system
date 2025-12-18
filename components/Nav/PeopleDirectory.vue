<template>
      <div class="">
        <div class="p-3 sm:p-4">
          <div class="flex flex-col gap-3 mb-4 sm:flex-row sm:items-center sm:justify-between">
            <h1 class="text-lg font-semibold text-gray-900">Families</h1>
            <div class="flex items-center gap-2">
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
                  {{ formatPersonName(family) }}
                </p>

                <p class="font-medium text-gray-800">
                  {{ family.address }}
                </p>

                </div>
              </div>
              </div>
            </div>
          </div>

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
                    {{ family.display_name }}
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
          <PaginationGlobal
            :page="page"
            :total-pages="totalPages"
            @update:page="page = $event; fetchFamilies()"
          />
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
import { useRoute, useRouter } from '#app';
import ReceiptModal from '~/components/Modals/ReceiptModal.vue';
import PaginationGlobal from '~/components/Others/PaginationGlobal.vue';
import SearchBar from '~/components/Others/SearchBar.vue';

    export default {
        components: {
            ReceiptModal,
            PaginationGlobal,
            SearchBar
        },
        data() {
            return {
              showReceiptModal: false,
              selectedFamily: null,
              families: [],
              loading: true,
              error: null,
              search: '',
              // Pagination
              page: 1,
              pageSize: 10, 
              totalPages: 1,

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

          document.addEventListener('click', this.handleClickOutside)

          await this.fetchFamilies()
        },
        beforeUnmount() {
          document.removeEventListener('click', this.handleClickOutside)
        },
        methods: {
            async fetchFamilies() {
              this.$loading.show('Loading Data, Please wait...')

              try {
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
                .order('middle_name', { ascending: true })


                if (this.search) {
                  query = query.or(
                    `first_name.ilike.%${this.search}%,middle_name.ilike.%${this.search}%,last_name.ilike.%${this.search}%,suffix.ilike.%${this.search}%,address.ilike.%${this.search}%`
                  )
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

                // Compute Total Payment per family
                this.families = data.map(f => ({
                    id: f.id,
                    display_name: this.formatPersonName(f),
                    address: f.address,
                    total_payment: (f.payments || []).reduce(
                        (sum, p) => sum + Number(p.amount),
                        0
                    )
                }))
              } catch (err) {
                console.error(err)
                this.$notify.error('Failed to load Families')
              }finally {
                this.loading = false
                this.$loading.hide()
              } 
            },
            handleSearch(query) {
              this.search = query.trim()
              this.page = 1

              if (!this.search) {
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
            normalizeSearch() {
              return toValue
                .toLowerCase()
                .replace(/\s+/g, '')
                .replace(/[^a-z0-9]/g, '')
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
      `first_name.ilike.%${this.search}%,middle_name.ilike.%${this.search}%,last_name.ilike.%${this.search}%,address.ilike.%${this.search}%`
    )
    .order('last_name', { ascending: true })
    .order('first_name', { ascending: true })
    .order('middle_name', { ascending: true })
    .limit(5)

  this.searching = false

  if (error) {
    console.error('Search error:', error)
    this.searchResults = []
    this.showSearchResults = false
    return
  }

  this.searchResults = data
  this.showSearchResults = data.length > 0
},

            openReceiptModal(family) {
                this.selectedFamily = family
                this.showReceiptModal = true
            },
            handleClickOutside(e) {
              if (!this.$refs.searchWrapper?.contains(e.target)) {
                this.showSearchResults = false
              }
            },
            selectedSearchResult(family) {
              this.search = this.formatPersonName(family)

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
            formatPersonName(p) {
  if (!p) return ''

  const last = p.last_name || ''
  const first = p.first_name || ''
  const middle = p.middle_name
    ? p.middle_name.trim().charAt(0).toUpperCase() + '.'
    : ''
  const suffix = p.suffix ? ` ${p.suffix}` : ''

  return `${last}, ${first}${middle ? ' ' + middle : ''}${suffix}`
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

