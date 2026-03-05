import { useState, useMemo } from "react"

export default function Calendar({ transactions = [], onDateSelect }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const daysInMonth = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDay = firstDay.getDay()

    const days = []
    for (let i = 0; i < startingDay; i++) { days.push(null) }
    for (let i = 1; i <= daysInMonth; i++) { days.push(new Date(year, month, i)) }
    return days
  }, [currentDate])

  const transactionsByDate = useMemo(() => {
    const grouped = {}
    transactions.forEach(tx => {
      const key = tx.date
      if (!grouped[key]) { grouped[key] = [] }
      grouped[key].push(tx)
    })
    return grouped
  }, [transactions])

  const monthlySummary = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const monthStr = String(month + 1).padStart(2, '0')
    const monthPrefix = `${year}-${monthStr}`
    
    const monthTransactions = transactions.filter(tx => {
      return tx.date && tx.date.startsWith(monthPrefix)
    })
    const income = monthTransactions.filter(tx => tx.type === "income").reduce((sum, tx) => sum + tx.amount, 0)
    const expense = monthTransactions.filter(tx => tx.type === "expense").reduce((sum, tx) => sum + tx.amount, 0)
    const savings = monthTransactions.filter(tx => tx.type === "savings").reduce((sum, tx) => sum + tx.amount, 0)
    return { income, expense, savings, total: income - expense }
  }, [transactions, currentDate])

  const getTransactionsForDate = (date) => {
    if (!date) return []
    // Use local date formatting to avoid UTC conversion issues
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    return transactionsByDate[key] || []
  }

  const getDateMarkers = (date) => {
    if (!date) return { hasTransactions: false, hasIncome: false, hasExpense: false, hasSavings: false }
    const txs = getTransactionsForDate(date)
    return {
      hasTransactions: txs.length > 0,
      hasIncome: txs.some(tx => tx.type === "income"),
      hasExpense: txs.some(tx => tx.type === "expense"),
      hasSavings: txs.some(tx => tx.type === "savings"),
      totalIncome: txs.filter(tx => tx.type === "income").reduce((sum, tx) => sum + tx.amount, 0),
      totalExpense: txs.filter(tx => tx.type === "expense").reduce((sum, tx) => sum + tx.amount, 0),
      totalSavings: txs.filter(tx => tx.type === "savings").reduce((sum, tx) => sum + tx.amount, 0),
    }
  }

  const handleDateClick = (date) => {
    if (!date) return
    setSelectedDate(date)
    if (onDateSelect) { onDateSelect(date) }
  }

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
    setSelectedDate(null)
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
    setSelectedDate(null)
  }

  const goToToday = () => {
    setCurrentDate(new Date())
    setSelectedDate(new Date())
  }

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const selectedDateTransactions = selectedDate ? getTransactionsForDate(selectedDate) : []
  const isToday = (date) => date && date.toDateString() === today.toDateString()
  const isSelected = (date) => date && selectedDate && date.toDateString() === selectedDate.toDateString()

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white">
        <div className="flex items-center justify-between">
          <button onClick={goToPreviousMonth} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div className="text-center">
            <h3 className="text-xl font-bold">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
            <button onClick={goToToday} className="text-sm opacity-80 hover:opacity-100 hover:underline">Go to Today</button>
          </div>
          <button onClick={goToNextMonth} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 bg-gray-50 border-b">
        {dayNames.map((day) => (<div key={day} className="py-3 text-center text-sm font-semibold text-gray-600">{day}</div>))}
      </div>

      <div className="grid grid-cols-7">
        {daysInMonth.map((date, index) => {
          const markers = getDateMarkers(date)
          return (
            <div key={index} onClick={() => handleDateClick(date)} className={`min-h-[80px] p-2 border-b border-r cursor-pointer transition-all ${!date ? "bg-gray-30" : "hover:bg-gray-50"} ${isSelected(date) ? "bg-blue-50 ring-2 ring-blue-500" : ""} ${isToday(date) ? "bg-blue-50" : ""}`}>
              {date && (
                <>
                  <div className={`text-sm font-semibold mb-1 ${isToday(date) ? "text-blue-600" : "text-gray-700"}`}>{date.getDate()}</div>
                  <div className="space-y-1">
                    {markers.hasIncome && (<div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span><span className="text-xs text-green-700 font-medium">+Rs{markers.totalIncome.toLocaleString()}</span></div>)}
                    {markers.hasExpense && (<div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span><span className="text-xs text-red-700 font-medium">-Rs{markers.totalExpense.toLocaleString()}</span></div>)}
                    {markers.hasSavings && (<div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span><span className="text-xs text-blue-700 font-medium">Rs{markers.totalSavings.toLocaleString()}</span></div>)}
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>

      {selectedDate && (
        <div className="p-4 border-t bg-gray-50">
          <h4 className="font-semibold text-gray-800 mb-3">Transactions on {selectedDate.toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</h4>
          {selectedDateTransactions.length > 0 ? (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {selectedDateTransactions.map((tx, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-white rounded-lg shadow-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{tx.type === "income" ? "I" : tx.type === "expense" ? "E" : "S"}</span>
                    <div><p className="text-sm font-medium text-gray-800">{tx.description || tx.type}</p><p className="text-xs text-gray-500 capitalize">{tx.type}</p></div>
                  </div>
                  <span className={`font-semibold ${tx.type === "expense" ? "text-red-600" : "text-green-600"}`}>{tx.type === "expense" ? "-" : "+"}Rs{tx.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          ) : (<p className="text-gray-500 text-sm">No transactions on this date</p>)}
        </div>
      )}

      <div className="p-4 border-t bg-gradient-to-r from-gray-50 to-gray-100">
        <h4 className="font-semibold text-gray-800 mb-3">Monthly Summary - {monthNames[currentDate.getMonth()]}</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-3 rounded-lg shadow-sm border-l-4 border-green-500"><p className="text-xs text-gray-500">Total Income</p><p className="text-lg font-bold text-green-600">+Rs{monthlySummary.income.toLocaleString()}</p></div>
          <div className="bg-white p-3 rounded-lg shadow-sm border-l-4 border-red-500"><p className="text-xs text-gray-500">Total Expenses</p><p className="text-lg font-bold text-red-600">-Rs{monthlySummary.expense.toLocaleString()}</p></div>
          <div className="bg-white p-3 rounded-lg shadow-sm border-l-4 border-blue-500"><p className="text-xs text-gray-500">Total Savings</p><p className="text-lg font-bold text-blue-600">Rs{monthlySummary.savings.toLocaleString()}</p></div>
          <div className="bg-white p-3 rounded-lg shadow-sm border-l-4 border-purple-500"><p className="text-xs text-gray-500">Net Balance</p><p className={`text-lg font-bold ${monthlySummary.total >= 0 ? "text-green-600" : "text-red-600"}`}>{monthlySummary.total >= 0 ? "+" : ""}Rs{monthlySummary.total.toLocaleString()}</p></div>
        </div>
      </div>

      <div className="p-3 bg-gray-50 border-t flex items-center justify-center gap-6 text-xs">
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-green-500"></span><span className="text-gray-600">Income</span></div>
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500"></span><span className="text-gray-600">Expense</span></div>
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-500"></span><span className="text-gray-600">Savings</span></div>
      </div>
    </div>
  )
}

