<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">
      Full Transaction Report (Spreadsheet View)
    </h1>

    <div class="overflow-x-auto border rounded bg-white">
      <table class="w-full text-sm border-collapse">
        <thead class="bg-gray-100 text-xs uppercase">
          <tr>
            <th class="border px-3 py-2 text-left">Level</th>
            <th class="border px-3 py-2 text-left">Name</th>
            <th class="border px-3 py-2 text-left">Receipt #</th>
            <th class="border px-3 py-2 text-left">Type</th>
            <th class="border px-3 py-2 text-left">Date</th>
            <th class="border px-3 py-2 text-right">Amount ₱</th>
          </tr>
        </thead>

        <tbody>
          <template v-for="purok in purokReports" :key="purok.name">
            <!-- PUROK -->
            <tr class="bg-blue-50 text-blue-800 font-semibold cursor-pointer border-b border-blue-200" @click="purok.open = !purok.open">
              <td class="border px-3 py-2">Purok</td>
              <td class="border px-3 py-2" colspan="5">
                {{ purok.open ? '▼' : '▶' }} {{ purok.name }}
              </td>
            </tr>

            <template v-if="purok.open">
              <!-- FAMILY -->
              <template v-for="family in purok.families" :key="family.id">
                <tr class="bg-green-50 text-green-800 font-medium cursor-pointer border-b border-green-200 font-medium cursor-pointer" @click="family.open = !family.open">
                  <td class="border px-3 py-2 pl-6">Family</td>
                  <td class="border px-3 py-2">
                    {{ family.open ? '▼' : '▶' }} {{ family.head }}
                  </td>
                  <td class="border px-3 py-2"></td>
                  <td class="border px-3 py-2"></td>
                  <td class="border px-3 py-2"></td>
                  <td class="border px-3 py-2 text-right">
                    ₱{{ formatCurrency(family.total) }}
                  </td>
                </tr>

                <template v-if="family.open">
                  <!-- MEMBER -->
                  <template v-for="member in family.members" :key="member.id">
                    <tr class="bg-yellow-50 text-yellow-800 cursor-pointer border-b border-yellow-200 cursor-pointer" @click="member.open = !member.open">
                      <td class="border px-3 py-2 pl-10">Member</td>
                      <td class="border px-3 py-2">
                        {{ member.open ? '▼' : '▶' }} {{ member.name }}
                      </td>
                      <td class="border px-3 py-2"></td>
                      <td class="border px-3 py-2"></td>
                      <td class="border px-3 py-2"></td>
                      <td class="border px-3 py-2 text-right">
                        ₱{{ formatCurrency(member.total) }}
                      </td>
                    </tr>

                    <!-- TRANSACTIONS -->
                    <tr
                      v-for="tx in member.transactions"
                      v-if="member.open"
                      :key="tx.id"
                      class="bg-white text-gray-700 border-b border-gray-200"
                    >
                      <td class="border px-3 py-2 pl-14">Txn</td>
                      <td class="border px-3 py-2"></td>
                      <td class="border px-3 py-2">{{ tx.receipt }}</td>
                      <td class="border px-3 py-2">{{ tx.category }}</td>
                      <td class="border px-3 py-2">{{ tx.date }}</td>
                      <td class="border px-3 py-2 text-right">
                        ₱{{ formatCurrency(tx.amount) }}
                      </td>
                    </tr>
                  </template>
                </template>
              </template>
            </template>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { useSupabaseClient } from '#imports'

export default {
  data() {
    return {
      purokReports: []
    }
  },

  async mounted() {
    await this.loadReport()
  },

  methods: {
    async loadReport() {
      const supabase = useSupabaseClient()

      const { data: families } = await supabase
        .from('families')
        .select('id, first_name, middle_name, last_name, suffix, purok')

      const { data: members } = await supabase
        .from('members')
        .select('id, family_id, first_name, middle_name, last_name, suffix')

      const { data: payments } = await supabase
        .from('payments')
        .select('id, family_id, member_id, receipt_number, category, amount, created_at')

      const purokMap = {}

      // INIT
      families.forEach(f => {
        const purok = f.purok || 'Unassigned'
        if (!purokMap[purok]) {
          purokMap[purok] = { name: purok, open: false, families: [] }
        }

        purokMap[purok].families.push({
          id: f.id,
          head: this.formatFullName (
            f.first_name,
            f.middle_name,
            f.last_name,
            f.suffix
          ),
          open: false,
          total: 0,
          members: []
        })
      })

      // MEMBERS
      members.forEach(m => {
        Object.values(purokMap).forEach(p => {
          const fam = p.families.find(f => f.id === m.family_id)
          if (fam) {
            fam.members.push({
              id: m.id,
              name: `${m.first_name} ${m.last_name}`,
              open: false,
              total: 0,
              transactions: []
            })
          }
        })
      })

      // TRANSACTIONS (✅ FIXED)
      // TRANSACTIONS (✅ FIXED)
payments.forEach(t => {
  Object.values(purokMap).forEach(p => {
    const fam = p.families.find(f => f.id === t.family_id)
    if (!fam) return

    const amount = Number(t.amount) || 0
    fam.total += amount

    let member = fam.members.find(m => m.id === t.member_id)
    if (!member) {
      member = {
        id: `head-${fam.id}`,
        name: fam.head + ' (Head)',
        open: false,
        total: 0,
        transactions: []
      }
      fam.members.unshift(member)
    }

    member.transactions.push({
      id: t.id,
      receipt: t.receipt_number,
      category: t.category,
      date: new Date(t.created_at).toLocaleDateString(),
      amount
    })

    member.total += amount
  })
})

// 🔤 SORT FAMILIES & MEMBERS ALPHABETICALLY
Object.values(purokMap).forEach(p => {
  // sort families by formatted head name (Last, First...)
  p.families.sort((a, b) => a.head.localeCompare(b.head))

  // sort members inside each family
  p.families.forEach(f => {
    f.members.sort((a, b) => a.name.localeCompare(b.name))
  })
})



      this.purokReports = Object.values(purokMap).sort((a, b) => {
        const getNumber = (name) => {
            const match = name.match(/\d+/)
            return match ? Number(match[0]) : 999
        }

        return getNumber(a.name) - getNumber(b.name)
      })
    },

    formatCurrency(v) {
      return Number(v || 0).toLocaleString()
    },
    formatFullName(first, middle, last, suffix) {
  const middleInitial = middle
    ? ` ${middle.trim().charAt(0).toUpperCase()}.`
    : ''

  const suffixPart = suffix
    ? `, ${suffix}`
    : ''

  return `${last}, ${first}${middleInitial}${suffixPart}`
}

  }
}
</script>
