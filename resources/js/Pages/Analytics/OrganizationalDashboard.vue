<template>
  <AuthenticatedLayout>
    <div class="min-h-screen" :class="isDark ? 'bg-gray-900' : 'bg-gray-50'">

      <!-- Header -->
      <div class="border-b" :class="isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <nav class="flex mb-3 text-sm">
            <Link :href="route('dashboard')" :class="isDark?'text-gray-400 hover:text-gray-200':'text-gray-500 hover:text-gray-700'">Dashboard</Link>
            <span class="mx-2 text-gray-400">/</span>
            <span class="font-medium" :class="isDark?'text-white':'text-gray-900'">Organizational Analytics</span>
          </nav>
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 class="text-3xl font-bold" :class="isDark?'text-white':'text-gray-900'">Organizational Analytics</h1>
              <p class="mt-1 text-sm" :class="isDark?'text-gray-400':'text-gray-500'">Live insights — attendance, performance, work activity, skill tests, leave</p>
            </div>
            <div class="flex items-center gap-3 flex-wrap">
              <div class="flex items-center gap-2 px-3 py-1 rounded-lg" :class="isDark?'bg-green-900/40':'bg-green-50'">
                <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span class="text-xs font-medium" :class="isDark?'text-green-400':'text-green-700'">Live · {{ formatTime(props.lastUpdated) }}</span>
              </div>
              <select v-model="selectedTimeRange" @change="updateFilters"
                class="rounded-lg border text-sm px-3 py-1.5"
                :class="isDark?'bg-gray-700 border-gray-600 text-white':'bg-white border-gray-300 text-gray-700'">
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 3 months</option>
                <option value="1y">Last year</option>
              </select>
              <button @click="refreshData" class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white" style="background:linear-gradient(135deg,#006970,#00a9b4)">
                <ArrowPathIcon class="w-4 h-4" /> Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        <!-- KPI Cards -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div v-for="k in kpiCards" :key="k.title" class="rounded-2xl p-5 shadow-sm border" :class="cardClass">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium" :class="isDark?'text-gray-400':'text-gray-600'">{{ k.title }}</p>
                <p class="text-3xl font-bold mt-1" :class="isDark?'text-white':'text-gray-900'">{{ k.value }}</p>
                <div class="flex items-center gap-1 mt-2 text-sm">
                  <ArrowTrendingUpIcon v-if="k.up" class="w-4 h-4 text-green-500" />
                  <ArrowTrendingDownIcon v-else class="w-4 h-4" :class="k.lowerBetter ? 'text-green-500' : 'text-red-500'" />
                  <span :class="k.up ? 'text-green-600' : (k.lowerBetter ? 'text-green-600' : 'text-red-600')">{{ k.change }}</span>
                </div>
              </div>
              <div class="p-3 rounded-xl" :class="k.bg">
                <component :is="k.icon" class="w-7 h-7" :class="k.iconColor" />
              </div>
            </div>
          </div>
        </div>

        <!-- Row 1: Employee Growth + Performance Distribution -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <!-- Employee Growth -->
          <div class="rounded-2xl p-6 shadow-sm border" :class="cardClass">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold" :class="isDark?'text-white':'text-gray-900'">Employee Growth Trend</h3>
              <div class="flex gap-3 text-xs">
                <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 bg-teal-500 rounded-sm"></span><span :class="isDark?'text-gray-400':'text-gray-500'">Headcount</span></span>
                <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 bg-green-400 rounded-sm"></span><span :class="isDark?'text-gray-400':'text-gray-500'">New Hires</span></span>
              </div>
            </div>
            <div class="grid grid-cols-3 gap-3 mb-4 p-3 rounded-lg text-center" :class="isDark?'bg-gray-700/50':'bg-gray-50'">
              <div><div class="text-xl font-bold text-teal-500">{{ growthStats.current }}</div><div class="text-xs mt-0.5" :class="isDark?'text-gray-400':'text-gray-500'">Current Total</div></div>
              <div><div class="text-xl font-bold text-green-500">{{ growthStats.newHires }}</div><div class="text-xs mt-0.5" :class="isDark?'text-gray-400':'text-gray-500'">Period New Hires</div></div>
              <div><div class="text-xl font-bold text-purple-500">{{ growthStats.avgMonthly }}</div><div class="text-xs mt-0.5" :class="isDark?'text-gray-400':'text-gray-500'">Avg/Month</div></div>
            </div>
            <!-- Bar chart -->
            <div class="h-40 flex items-end gap-1 pt-2">
              <div v-for="(m,i) in employeeGrowthData" :key="i" class="flex-1 flex flex-col items-center gap-0.5">
                <div class="w-full relative" style="height:120px">
                  <div class="bg-teal-500 absolute bottom-0 w-full rounded-t transition-all duration-500"
                    :style="{ height: maxEmpTotal>0 ? (m.total_employees/maxEmpTotal*100)+'%' : '0%' }"></div>
                  <div class="bg-green-400 absolute bottom-0 w-1/2 rounded-t transition-all duration-500"
                    :style="{ height: maxNewHires>0 ? (m.new_hires/maxNewHires*80)+'%' : '0%' }"></div>
                </div>
                <span class="text-[10px] truncate w-full text-center" :class="isDark?'text-gray-500':'text-gray-400'">{{ m.month.split(' ')[0] }}</span>
              </div>
            </div>
          </div>

          <!-- Performance Distribution -->
          <div class="rounded-2xl p-6 shadow-sm border" :class="cardClass">
            <h3 class="text-lg font-semibold mb-4" :class="isDark?'text-white':'text-gray-900'">Assessment Performance Distribution</h3>
            <div class="grid grid-cols-4 gap-2 mb-4">
              <div v-for="b in perfBadges" :key="b.label" class="text-center p-2 rounded-lg" :class="b.bg">
                <div class="text-lg font-bold" :class="b.text">{{ b.value }}</div>
                <div class="text-xs font-medium" :class="b.text">{{ b.label }}</div>
                <div class="text-[10px] text-gray-400 mt-0.5">{{ b.sub }}</div>
              </div>
            </div>
            <!-- Donut chart CSS -->
            <div class="flex items-center justify-center my-4">
              <div class="relative w-40 h-40">
                <div class="w-full h-full rounded-full" :style="perfDonutStyle">
                  <div class="absolute inset-6 rounded-full flex items-center justify-center" :class="isDark?'bg-gray-800':'bg-white'">
                    <div class="text-center">
                      <div class="text-xl font-bold" :class="isDark?'text-white':'text-gray-900'">{{ perfData.total }}</div>
                      <div class="text-xs" :class="isDark?'text-gray-400':'text-gray-500'">Total</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <p class="text-center text-sm" :class="isDark?'text-gray-400':'text-gray-500'">
              Avg score: <span class="font-semibold" :class="isDark?'text-white':'text-gray-800'">{{ kpis.avgPerformance }}%</span>
              &nbsp;·&nbsp; {{ perfData.total }} assessments
            </p>
          </div>
        </div>

        <!-- Row 2: Attendance Heatmap + Attrition -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <!-- Attendance Heatmap -->
          <div class="lg:col-span-2 rounded-2xl p-6 shadow-sm border" :class="cardClass">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold" :class="isDark?'text-white':'text-gray-900'">Attendance Heatmap (Last 4 Weeks)</h3>
              <div class="text-right"><div class="text-xl font-bold text-teal-500">{{ attendanceData.overall_rate }}%</div><div class="text-xs" :class="isDark?'text-gray-400':'text-gray-500'">Overall Rate</div></div>
            </div>
            <div class="grid grid-cols-4 gap-3 mb-4 p-3 rounded-lg text-center" :class="isDark?'bg-gray-700/50':'bg-gray-50'">
              <div><div class="text-lg font-bold text-teal-500">{{ attendanceData.totalActive }}</div><div class="text-xs mt-0.5" :class="isDark?'text-gray-400':'text-gray-500'">Active Staff</div></div>
              <div><div class="text-lg font-bold text-green-500">{{ attendanceData.presentToday }}</div><div class="text-xs mt-0.5" :class="isDark?'text-gray-400':'text-gray-500'">Present Today</div></div>
              <div><div class="text-lg font-bold text-purple-500">{{ attendanceData.avgHours }}h</div><div class="text-xs mt-0.5" :class="isDark?'text-gray-400':'text-gray-500'">Avg Daily Hours</div></div>
              <div><div class="text-lg font-bold" :class="(attendanceData.trend??0)>=0?'text-green-500':'text-red-500'">{{ (attendanceData.trend??0)>=0?'+':'' }}{{ attendanceData.trend }}%</div><div class="text-xs mt-0.5" :class="isDark?'text-gray-400':'text-gray-500'">Trend</div></div>
            </div>
            <table class="w-full text-xs">
              <thead>
                <tr :class="isDark?'text-gray-400':'text-gray-500'">
                  <th class="pb-2 text-left w-10">Wk</th>
                  <th v-for="d in ['Mon','Tue','Wed','Thu','Fri']" :key="d" class="pb-2 text-center">{{ d }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="w in 4" :key="w">
                  <td class="pr-2 py-1 font-medium" :class="isDark?'text-gray-400':'text-gray-500'">W{{ w }}</td>
                  <td v-for="d in 5" :key="d" class="p-0.5">
                    <div class="h-9 rounded flex items-center justify-center text-white text-[11px] font-semibold" :class="heatColor(weekRate(w,d-1))">{{ weekRate(w,d-1) }}%</div>
                  </td>
                </tr>
              </tbody>
            </table>
            <div class="flex gap-4 mt-3 text-xs justify-center" :class="isDark?'text-gray-400':'text-gray-500'">
              <span class="flex items-center gap-1"><span class="w-3 h-3 bg-green-500 rounded"></span>95%+ Excellent</span>
              <span class="flex items-center gap-1"><span class="w-3 h-3 bg-yellow-500 rounded"></span>90–94% Good</span>
              <span class="flex items-center gap-1"><span class="w-3 h-3 bg-red-500 rounded"></span>&lt;90% Attention</span>
            </div>
          </div>

          <!-- Attrition -->
          <div class="rounded-2xl p-6 shadow-sm border" :class="cardClass">
            <h3 class="text-lg font-semibold mb-4" :class="isDark?'text-white':'text-gray-900'">Attrition Analysis</h3>
            <div class="grid grid-cols-2 gap-3 mb-4">
              <div class="text-center p-3 rounded-lg bg-red-50"><div class="text-xl font-bold text-red-600">{{ attrition.total_departures }}</div><div class="text-xs text-red-700">Departures</div></div>
              <div class="text-center p-3 rounded-lg bg-teal-50"><div class="text-xl font-bold text-teal-600">{{ attrition.rate }}%</div><div class="text-xs text-teal-700">Rate</div></div>
            </div>
            <div class="flex items-center justify-center mb-4">
              <div class="relative w-32 h-32">
                <div class="w-full h-full rounded-full" :style="attritionDonutStyle">
                  <div class="absolute inset-4 rounded-full flex items-center justify-center" :class="isDark?'bg-gray-800':'bg-white'">
                    <div class="text-center"><div class="text-lg font-bold" :class="isDark?'text-white':'text-gray-900'">{{ attrition.total_departures }}</div><div class="text-xs" :class="isDark?'text-gray-400':'text-gray-500'">Total</div></div>
                  </div>
                </div>
              </div>
            </div>
            <div class="space-y-2">
              <div v-for="seg in attritionSegments" :key="seg.label" class="flex justify-between items-center text-sm p-2 rounded" :class="isDark?'bg-gray-700/50':'bg-gray-50'">
                <span class="flex items-center gap-2" :class="isDark?'text-gray-200':'text-gray-700'">
                  <span class="w-3 h-3 rounded-sm" :style="{ background: seg.color }"></span>{{ seg.label }}
                </span>
                <span class="font-semibold" :class="isDark?'text-white':'text-gray-800'">{{ seg.value }}%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Row 3: Work Reports -->
        <div class="rounded-2xl p-6 shadow-sm border" :class="cardClass">
          <div class="flex items-center justify-between mb-5">
            <h3 class="text-lg font-semibold" :class="isDark?'text-white':'text-gray-900'">Work Reports — Activity Overview</h3>
            <span class="text-xs px-2.5 py-1 rounded-full font-medium bg-teal-100 text-teal-700">{{ selectedTimeRange }}</span>
          </div>
          <div class="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-9 gap-3 mb-6">
            <div v-for="m in workReportMetrics" :key="m.label" class="text-center p-2.5 rounded-xl" :class="isDark?'bg-gray-700/50':'bg-gray-50'">
              <div class="text-xl font-bold" :class="m.color">{{ m.value }}</div>
              <div class="text-[10px] mt-0.5 font-medium" :class="isDark?'text-gray-400':'text-gray-500'">{{ m.label }}</div>
            </div>
          </div>
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="flex flex-col items-center justify-center p-6 rounded-xl" :class="isDark?'bg-gray-700/50':'bg-gray-50'">
              <div class="text-5xl font-extrabold text-teal-500">{{ workReports.conversion_rate }}%</div>
              <div class="text-sm mt-2 font-medium" :class="isDark?'text-gray-300':'text-gray-600'">Conversion Rate</div>
              <div class="text-xs mt-1" :class="isDark?'text-gray-500':'text-gray-400'">(Interested / Total Calls)</div>
            </div>
            <div class="lg:col-span-2">
              <p class="text-sm font-medium mb-3" :class="isDark?'text-gray-300':'text-gray-600'">Monthly Calls Trend</p>
              <div class="h-28 flex items-end gap-1">
                <div v-for="(m,i) in (workReports.monthly_trend||[])" :key="i" class="flex-1 flex flex-col items-center gap-0.5">
                  <div class="w-full relative rounded-t overflow-hidden" style="height:96px">
                    <div class="bg-teal-400 absolute bottom-0 w-full rounded-t transition-all"
                      :style="{ height: maxWrCalls>0 ? (m.calls/maxWrCalls*100)+'%' : '0%' }"></div>
                    <div class="bg-green-400 absolute bottom-0 w-1/2 rounded-t transition-all"
                      :style="{ height: maxWrCalls>0 ? (m.interested/maxWrCalls*100)+'%' : '0%' }"></div>
                  </div>
                  <span class="text-[9px] truncate w-full text-center" :class="isDark?'text-gray-500':'text-gray-400'">{{ (m.month||'').split(' ')[0] }}</span>
                </div>
                <div v-if="!(workReports.monthly_trend||[]).length" class="flex-1 text-center text-xs py-8" :class="isDark?'text-gray-500':'text-gray-400'">No data</div>
              </div>
            </div>
          </div>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <div>
              <p class="text-sm font-semibold mb-3" :class="isDark?'text-gray-200':'text-gray-700'">Top Performers</p>
              <div v-if="!(workReports.top_performers||[]).length" class="text-sm py-6 text-center" :class="isDark?'text-gray-500':'text-gray-400'">No data for this period</div>
              <div v-for="(p,i) in (workReports.top_performers||[])" :key="i" class="flex items-center gap-3 mb-2 p-2.5 rounded-lg" :class="isDark?'bg-gray-700/50':'bg-gray-50'">
                <span class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" :style="{ background: ['#14B8A6','#10B981','#6366F1','#F59E0B','#EF4444'][i] }">{{ i+1 }}</span>
                <div class="flex-1 min-w-0"><div class="text-sm font-medium truncate" :class="isDark?'text-white':'text-gray-800'">{{ p.name }}</div><div class="text-xs" :class="isDark?'text-gray-400':'text-gray-500'">{{ p.days_reported }} days reported</div></div>
                <div class="text-right"><div class="text-sm font-bold text-teal-500">{{ p.total_calls }}</div><div class="text-xs" :class="isDark?'text-gray-400':'text-gray-500'">calls</div></div>
              </div>
            </div>
            <div>
              <p class="text-sm font-semibold mb-3" :class="isDark?'text-gray-200':'text-gray-700'">Department Breakdown</p>
              <div v-if="!(workReports.dept_breakdown||[]).length" class="text-sm py-6 text-center" :class="isDark?'text-gray-500':'text-gray-400'">No data for this period</div>
              <div v-for="d in (workReports.dept_breakdown||[])" :key="d.dept" class="mb-2.5">
                <div class="flex justify-between text-xs mb-1"><span :class="isDark?'text-gray-300':'text-gray-600'">{{ d.dept }}</span><span class="font-semibold" :class="isDark?'text-white':'text-gray-800'">{{ d.calls }}</span></div>
                <div class="w-full h-2 rounded-full" :class="isDark?'bg-gray-700':'bg-gray-200'">
                  <div class="h-2 rounded-full bg-teal-500 transition-all" :style="{ width: maxDeptCalls>0 ? (d.calls/maxDeptCalls*100)+'%' : '0%' }"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Row 4: Skill Tests -->
        <div class="rounded-2xl p-6 shadow-sm border" :class="cardClass">
          <div class="flex items-center justify-between mb-5">
            <h3 class="text-lg font-semibold" :class="isDark?'text-white':'text-gray-900'">Skill Test Analytics</h3>
            <span class="text-xs px-2.5 py-1 rounded-full font-medium bg-purple-100 text-purple-700">{{ selectedTimeRange }}</span>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
            <div v-for="b in skillTestBadges" :key="b.label" class="text-center p-3 rounded-xl" :class="b.bg">
              <div class="text-2xl font-bold" :class="b.text">{{ b.value }}</div>
              <div class="text-xs font-medium mt-0.5" :class="b.text">{{ b.label }}</div>
            </div>
          </div>
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div>
              <p class="text-sm font-semibold mb-3" :class="isDark?'text-gray-200':'text-gray-700'">Score Distribution</p>
              <div class="space-y-2.5">
                <div v-for="s in scoreDistBars" :key="s.label">
                  <div class="flex justify-between text-xs mb-1"><span :class="isDark?'text-gray-300':'text-gray-600'">{{ s.label }}</span><span class="font-semibold" :class="isDark?'text-white':'text-gray-800'">{{ s.value }}</span></div>
                  <div class="w-full h-3 rounded-full" :class="isDark?'bg-gray-700':'bg-gray-200'">
                    <div class="h-3 rounded-full transition-all" :class="s.color" :style="{ width: skillTests.overview.completed>0 ? (s.value/skillTests.overview.completed*100)+'%' : '0%' }"></div>
                  </div>
                </div>
              </div>
            </div>
            <div class="lg:col-span-2">
              <p class="text-sm font-semibold mb-3" :class="isDark?'text-gray-200':'text-gray-700'">Test Performance</p>
              <div v-if="!(skillTests.test_performance||[]).length" class="text-sm py-6 text-center" :class="isDark?'text-gray-500':'text-gray-400'">No test data for this period</div>
              <div v-else class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="text-xs uppercase tracking-wider border-b" :class="[isDark?'text-gray-400 border-gray-700':'text-gray-500 border-gray-200']">
                      <th class="text-left py-2">Test</th>
                      <th class="text-center py-2">Attempts</th>
                      <th class="text-center py-2">Avg Score</th>
                      <th class="text-center py-2">Pass Rate</th>
                      <th class="text-left py-2">Level</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="t in (skillTests.test_performance||[])" :key="t.name" class="border-b" :class="isDark?'border-gray-700':'border-gray-100'">
                      <td class="py-2 pr-2 font-medium max-w-[130px] truncate" :class="isDark?'text-white':'text-gray-800'" :title="t.name">{{ t.name }}</td>
                      <td class="py-2 text-center" :class="isDark?'text-gray-300':'text-gray-600'">{{ t.attempts }}</td>
                      <td class="py-2 text-center font-semibold" :class="t.avg_score>=75?'text-green-500':t.avg_score>=60?'text-yellow-500':'text-red-500'">{{ t.avg_score }}%</td>
                      <td class="py-2 text-center font-semibold" :class="t.pass_rate>=70?'text-teal-500':'text-orange-500'">{{ t.pass_rate }}%</td>
                      <td class="py-2"><span class="px-1.5 py-0.5 rounded text-xs font-medium" :class="t.difficulty==='hard'?'bg-red-100 text-red-700':t.difficulty==='medium'?'bg-yellow-100 text-yellow-700':'bg-green-100 text-green-700'">{{ t.difficulty }}</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div class="mt-6">
            <p class="text-sm font-medium mb-2" :class="isDark?'text-gray-300':'text-gray-600'">Monthly Test Activity (Attempts vs Passed)</p>
            <div class="h-24 flex items-end gap-1">
              <div v-for="(m,i) in (skillTests.monthly_trend||[])" :key="i" class="flex-1 flex flex-col items-center gap-0.5">
                <div class="w-full relative rounded-t overflow-hidden" style="height:80px">
                  <div class="bg-indigo-400 absolute bottom-0 w-full rounded-t transition-all" :style="{ height: maxStAttempts>0 ? (m.attempts/maxStAttempts*100)+'%' : '0%' }"></div>
                  <div class="bg-green-400 absolute bottom-0 w-1/2 rounded-t transition-all" :style="{ height: maxStAttempts>0 ? (m.passed/maxStAttempts*100)+'%' : '0%' }"></div>
                </div>
                <span class="text-[9px] truncate w-full text-center" :class="isDark?'text-gray-500':'text-gray-400'">{{ (m.month||'').split(' ')[0] }}</span>
              </div>
              <div v-if="!(skillTests.monthly_trend||[]).length" class="flex-1 text-center text-xs py-8" :class="isDark?'text-gray-500':'text-gray-400'">No data</div>
            </div>
          </div>
        </div>

        <!-- Row 5: Leave Analytics -->
        <div class="rounded-2xl p-6 shadow-sm border" :class="cardClass">
          <div class="flex items-center justify-between mb-5">
            <h3 class="text-lg font-semibold" :class="isDark?'text-white':'text-gray-900'">Leave Analytics</h3>
            <span class="text-xs px-2.5 py-1 rounded-full font-medium bg-orange-100 text-orange-700">{{ selectedTimeRange }}</span>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
            <div v-for="b in leaveBadges" :key="b.label" class="text-center p-2.5 rounded-xl" :class="b.bg">
              <div class="text-xl font-bold" :class="b.text">{{ b.value }}</div>
              <div class="text-[11px] font-medium mt-0.5" :class="b.text">{{ b.label }}</div>
            </div>
          </div>
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div>
              <p class="text-sm font-semibold mb-3" :class="isDark?'text-gray-200':'text-gray-700'">By Leave Type</p>
              <div v-if="!(leave.by_type||[]).length" class="text-sm py-6 text-center" :class="isDark?'text-gray-500':'text-gray-400'">No leave data</div>
              <div v-for="lt in (leave.by_type||[])" :key="lt.type" class="mb-2.5">
                <div class="flex justify-between text-xs mb-1"><span :class="isDark?'text-gray-300':'text-gray-600'">{{ lt.type }}</span><span class="font-semibold" :class="isDark?'text-white':'text-gray-800'">{{ lt.requests }} req</span></div>
                <div class="w-full h-2 rounded-full" :class="isDark?'bg-gray-700':'bg-gray-200'">
                  <div class="h-2 rounded-full bg-orange-400 transition-all" :style="{ width: maxLeaveType>0 ? (lt.requests/maxLeaveType*100)+'%' : '0%' }"></div>
                </div>
              </div>
            </div>
            <div>
              <p class="text-sm font-semibold mb-3" :class="isDark?'text-gray-200':'text-gray-700'">By Department</p>
              <div v-if="!(leave.by_dept||[]).length" class="text-sm py-6 text-center" :class="isDark?'text-gray-500':'text-gray-400'">No department data</div>
              <div v-for="d in (leave.by_dept||[])" :key="d.dept" class="mb-2.5">
                <div class="flex justify-between text-xs mb-1"><span :class="isDark?'text-gray-300':'text-gray-600'">{{ d.dept }}</span><span class="font-semibold" :class="isDark?'text-white':'text-gray-800'">{{ d.requests }}</span></div>
                <div class="w-full h-2 rounded-full" :class="isDark?'bg-gray-700':'bg-gray-200'">
                  <div class="h-2 rounded-full bg-indigo-400 transition-all" :style="{ width: maxLeaveDept>0 ? (d.requests/maxLeaveDept*100)+'%' : '0%' }"></div>
                </div>
              </div>
            </div>
            <div>
              <p class="text-sm font-semibold mb-3" :class="isDark?'text-gray-200':'text-gray-700'">Monthly Leave Trend</p>
              <div class="h-32 flex items-end gap-1">
                <div v-for="(m,i) in (leave.monthly_trend||[])" :key="i" class="flex-1 flex flex-col items-center gap-0.5">
                  <div class="w-full relative rounded-t overflow-hidden" style="height:100px">
                    <div class="bg-orange-400 absolute bottom-0 w-full rounded-t transition-all" :style="{ height: maxLeaveMonthly>0 ? (m.requests/maxLeaveMonthly*100)+'%' : '0%' }"></div>
                    <div class="bg-green-400 absolute bottom-0 w-1/2 rounded-t transition-all" :style="{ height: maxLeaveMonthly>0 ? (m.approved/maxLeaveMonthly*100)+'%' : '0%' }"></div>
                  </div>
                  <span class="text-[9px] truncate w-full text-center" :class="isDark?'text-gray-500':'text-gray-400'">{{ (m.month||'').split(' ')[0] }}</span>
                </div>
                <div v-if="!(leave.monthly_trend||[]).length" class="flex-1 text-center text-xs py-8" :class="isDark?'text-gray-500':'text-gray-400'">No data</div>
              </div>
              <div class="flex gap-3 mt-2 text-xs justify-center" :class="isDark?'text-gray-400':'text-gray-500'">
                <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 bg-orange-400 rounded-sm"></span>Requests</span>
                <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 bg-green-400 rounded-sm"></span>Approved</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Row 6: Skills Matrix + Dept Performance -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="rounded-2xl p-6 shadow-sm border" :class="cardClass">
            <h3 class="text-lg font-semibold mb-4" :class="isDark?'text-white':'text-gray-900'">Competency Skills Matrix</h3>
            <div class="flex gap-4 text-xs mb-4 justify-center">
              <span class="flex items-center gap-1"><span class="w-3 h-3 bg-green-500 rounded-sm"></span><span :class="isDark?'text-gray-400':'text-gray-500'">Expert</span></span>
              <span class="flex items-center gap-1"><span class="w-3 h-3 bg-yellow-500 rounded-sm"></span><span :class="isDark?'text-gray-400':'text-gray-500'">Proficient</span></span>
              <span class="flex items-center gap-1"><span class="w-3 h-3 bg-red-500 rounded-sm"></span><span :class="isDark?'text-gray-400':'text-gray-500'">Needs Dev</span></span>
            </div>
            <div class="space-y-3">
              <div v-for="(vals, skill) in (props.analytics.skillsMatrix||{})" :key="skill">
                <div class="flex justify-between text-xs mb-1"><span class="font-medium" :class="isDark?'text-gray-300':'text-gray-700'">{{ skill }}</span></div>
                <div class="flex h-5 rounded-full overflow-hidden" :class="isDark?'bg-gray-700':'bg-gray-200'">
                  <div v-if="vals.expert" class="bg-green-500 flex items-center justify-center text-[10px] text-white font-semibold" :style="{ width: vals.expert+'%' }">{{ vals.expert>12 ? vals.expert+'%' : '' }}</div>
                  <div v-if="vals.proficient" class="bg-yellow-500 flex items-center justify-center text-[10px] text-white font-semibold" :style="{ width: vals.proficient+'%' }">{{ vals.proficient>12 ? vals.proficient+'%' : '' }}</div>
                  <div v-if="vals.needs_development" class="bg-red-500 flex items-center justify-center text-[10px] text-white font-semibold" :style="{ width: vals.needs_development+'%' }">{{ vals.needs_development>12 ? vals.needs_development+'%' : '' }}</div>
                  <div v-if="!vals.expert && !vals.proficient && !vals.needs_development" class="flex-1 flex items-center justify-center text-[10px]" :class="isDark?'text-gray-600':'text-gray-400'">No data</div>
                </div>
              </div>
            </div>
          </div>

          <div class="rounded-2xl p-6 shadow-sm border" :class="cardClass">
            <h3 class="text-lg font-semibold mb-4" :class="isDark?'text-white':'text-gray-900'">Department Assessment Scores</h3>
            <div v-if="deptPerformance.length===0" class="flex items-center justify-center h-40 text-sm" :class="isDark?'text-gray-500':'text-gray-400'">No department data available</div>
            <div v-else class="space-y-3">
              <div v-for="d in deptPerformance" :key="d.name">
                <div class="flex justify-between text-sm mb-1">
                  <span :class="isDark?'text-gray-300':'text-gray-700'">{{ d.name }}</span>
                  <span class="font-semibold" :class="d.score>=80?'text-green-500':d.score>=60?'text-yellow-500':'text-red-500'">{{ d.score }}%</span>
                </div>
                <div class="w-full h-4 rounded-full overflow-hidden" :class="isDark?'bg-gray-700':'bg-gray-200'">
                  <div class="h-full rounded-full transition-all duration-500" :class="d.score>=80?'bg-teal-500':d.score>=60?'bg-yellow-500':'bg-red-500'" :style="{ width: d.score+'%' }"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Row 7: Forecast + Risk -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="rounded-2xl p-6 shadow-sm border" :class="cardClass">
            <h3 class="text-lg font-semibold mb-4" :class="isDark?'text-white':'text-gray-900'">Workforce Forecast</h3>
            <div class="h-48 flex items-end gap-1 mb-4">
              <div v-for="(m,i) in forecastBars" :key="i" class="flex-1 flex flex-col items-center gap-0.5">
                <div class="w-full relative rounded-t overflow-hidden" style="height:140px">
                  <div class="absolute bottom-0 w-full rounded-t transition-all duration-500" :class="m.predicted ? 'bg-purple-400 opacity-70' : 'bg-teal-500'" :style="{ height: maxForecast>0 ? (m.count/maxForecast*100)+'%' : '0%' }"></div>
                </div>
                <span class="text-[9px] truncate w-full text-center" :class="isDark?'text-gray-500':'text-gray-400'">{{ m.label }}</span>
                <span v-if="m.predicted" class="text-[8px] text-purple-400 font-medium">pred</span>
              </div>
            </div>
            <div class="p-3 rounded-lg text-sm" :class="isDark?'bg-teal-900/30 text-teal-300':'bg-teal-50 text-teal-800'">
              <strong>Prediction:</strong> Based on current trends ({{ forecast.growth_rate }}% avg monthly growth),
              expect <strong>{{ forecast.predictions?.[2] ?? '—' }}</strong> employees in 3 months.
              Confidence: <strong>{{ forecast.confidence }}%</strong>
            </div>
          </div>

          <div class="rounded-2xl p-6 shadow-sm border" :class="cardClass">
            <h3 class="text-lg font-semibold mb-4" :class="isDark?'text-white':'text-gray-900'">Risk Assessment Dashboard</h3>
            <div class="space-y-4">
              <div v-for="r in riskItems" :key="r.label" class="flex items-center justify-between p-4 rounded-xl" :class="r.bg">
                <div>
                  <p class="font-semibold text-sm" :class="r.title">{{ r.label }}</p>
                  <p class="text-sm mt-0.5" :class="r.sub">{{ r.value }} {{ r.unit }}</p>
                </div>
                <ExclamationTriangleIcon class="w-8 h-8 flex-shrink-0" :class="r.icon" />
              </div>
              <div class="p-4 rounded-xl" :class="isDark?'bg-gray-700/50':'bg-gray-100'">
                <div class="flex justify-between items-center">
                  <span class="font-semibold text-sm" :class="isDark?'text-gray-200':'text-gray-800'">Overall Risk Score</span>
                  <span class="text-2xl font-extrabold" :class="risk.overall_risk_score<30?'text-green-500':risk.overall_risk_score<60?'text-yellow-500':'text-red-500'">{{ risk.overall_risk_score }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </AuthenticatedLayout>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Link, router } from '@inertiajs/vue3'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue'
import { useTheme } from '@/composables/useTheme.js'
import {
  ArrowPathIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon,
  UsersIcon, ChartBarIcon, ClockIcon, UserMinusIcon, ExclamationTriangleIcon,
} from '@heroicons/vue/24/outline'

const props = defineProps({
  analytics:         { type: Object, default: () => ({}) },
  timeRange:         { type: String, default: '30d' },
  performanceFilter: { type: String, default: 'all' },
  skillsFilter:      { type: String, default: 'all' },
  lastUpdated:       { type: String, default: '' },
})

const { isDark } = useTheme()
const selectedTimeRange = ref(props.timeRange)

const cardClass = computed(() =>
  isDark.value ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
)

// ── Helpers ──────────────────────────────────────────────────────────────────
const formatTime = (ts) => ts ? new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : ''
const safeNum    = (v, fallback = 0) => (v !== null && v !== undefined && !isNaN(v)) ? Number(v) : fallback

// ── Data shortcuts ────────────────────────────────────────────────────────────
const workReports = computed(() => props.analytics.workReports ?? {})
const skillTests  = computed(() => ({
  overview:          props.analytics.skillTests?.overview          ?? { total_attempts:0, completed:0, avg_score:0, pass_rate:0, passed:0 },
  score_distribution:props.analytics.skillTests?.score_distribution ?? { excellent:0, good:0, pass:0, fail:0 },
  test_performance:  props.analytics.skillTests?.test_performance  ?? [],
  monthly_trend:     props.analytics.skillTests?.monthly_trend     ?? [],
  category_breakdown:props.analytics.skillTests?.category_breakdown ?? [],
}))
const leave       = computed(() => ({
  overview:      props.analytics.leaveAnalytics?.overview      ?? { total:0, approved:0, pending:0, rejected:0, cancelled:0, avg_days:0, approval_rate:0, avg_approval_days:0 },
  by_type:       props.analytics.leaveAnalytics?.by_type       ?? [],
  by_dept:       props.analytics.leaveAnalytics?.by_dept       ?? [],
  monthly_trend: props.analytics.leaveAnalytics?.monthly_trend ?? [],
}))
const attrition  = computed(() => props.analytics.attritionAnalysis ?? { rate:0, total_departures:0, reasons_breakdown:{}, trend:0 })
const forecast   = computed(() => props.analytics.workforceForecast ?? { current_count:0, growth_rate:0, predictions:[], confidence:0 })
const risk       = computed(() => props.analytics.riskAssessment ?? { high_attrition_risk:0, performance_concerns:0, skill_gaps:0, leaveRisk:0, overall_risk_score:0 })
const attendanceData = computed(() => props.analytics.attendanceAnalytics ?? { weekly_patterns:{}, overall_rate:0, trend:0, avgHours:0, presentToday:0, totalActive:0 })

// ── KPIs ──────────────────────────────────────────────────────────────────────
const kpis = computed(() => {
  const growth  = props.analytics.employeeGrowth ?? []
  const current = growth.at(-1)?.total_employees ?? 0
  const prev    = growth.at(-2)?.total_employees ?? 0
  const growthRate = prev > 0 ? +(((current - prev) / prev) * 100).toFixed(1) : 0
  const perf    = props.analytics.performanceMetrics ?? {}
  const att     = props.analytics.attendanceAnalytics ?? {}
  const attr    = props.analytics.attritionAnalysis ?? {}
  const avgScore = safeNum(perf.avg_score, 0)
  return {
    totalEmployees:   current,
    employeeGrowth:   `${growthRate >= 0 ? '+' : ''}${growthRate}% this month`,
    avgPerformance:   avgScore,
    performanceChange:`${avgScore > 0 ? '+' : ''}${avgScore}% score`,
    attendanceRate:   safeNum(att.overall_rate, 0),
    attendanceChange: `${safeNum(att.trend, 0) >= 0 ? '+' : ''}${safeNum(att.trend, 0)}% trend`,
    attritionRate:    safeNum(attr.rate, 0),
    attritionTrend:   `${safeNum(attr.trend, 0) >= 0 ? '+' : ''}${safeNum(attr.trend, 0)}% vs prior`,
  }
})

const kpiCards = computed(() => [
  { title:'Total Employees',      value:kpis.value.totalEmployees,      change:kpis.value.employeeGrowth,    up:true,  bg:'bg-teal-100',   iconColor:'text-teal-600',   icon:UsersIcon,    lowerBetter:false },
  { title:'Avg Assessment Score', value:kpis.value.avgPerformance+'%',  change:kpis.value.performanceChange, up:true,  bg:'bg-green-100',  iconColor:'text-green-600',  icon:ChartBarIcon, lowerBetter:false },
  { title:'Attendance Rate',      value:kpis.value.attendanceRate+'%',  change:kpis.value.attendanceChange,  up:kpis.value.attendanceRate >= 90,  bg:'bg-purple-100', iconColor:'text-purple-600', icon:ClockIcon, lowerBetter:false },
  { title:'Attrition Rate',       value:kpis.value.attritionRate+'%',   change:kpis.value.attritionTrend,   up:false, bg:'bg-orange-100', iconColor:'text-orange-600', icon:UserMinusIcon, lowerBetter:true },
])

// ── Employee Growth ───────────────────────────────────────────────────────────
const employeeGrowthData = computed(() => (props.analytics.employeeGrowth ?? []).slice(-12))
const maxEmpTotal   = computed(() => Math.max(1, ...employeeGrowthData.value.map(m => m.total_employees)))
const maxNewHires   = computed(() => Math.max(1, ...employeeGrowthData.value.map(m => m.new_hires)))
const growthStats   = computed(() => {
  const data = employeeGrowthData.value
  return {
    current:    data.at(-1)?.total_employees ?? 0,
    newHires:   data.reduce((s, m) => s + m.new_hires, 0),
    avgMonthly: data.length > 1 ? Math.round(data.reduce((s, m) => s + m.new_hires, 0) / data.length) : 0,
  }
})

// ── Performance ───────────────────────────────────────────────────────────────
const perfData = computed(() => {
  const d = props.analytics.performanceMetrics?.distribution ?? {}
  const e = safeNum(d.excellent), g = safeNum(d.good), a = safeNum(d.average), n = safeNum(d.needs_improvement)
  return { excellent:e, good:g, average:a, needs_improvement:n, total:e+g+a+n }
})
const perfBadges = computed(() => [
  { label:'Excellent', value:perfData.value.excellent,         bg:'bg-green-50',  text:'text-green-700',  sub:'Rating 4-5' },
  { label:'Good',      value:perfData.value.good,              bg:'bg-teal-50',   text:'text-teal-700',   sub:'Rating 3' },
  { label:'Average',   value:perfData.value.average,           bg:'bg-yellow-50', text:'text-yellow-700', sub:'Rating 2' },
  { label:'Needs Work',value:perfData.value.needs_improvement, bg:'bg-red-50',    text:'text-red-700',    sub:'Rating 1' },
])
const perfDonutStyle = computed(() => {
  const { excellent:e, good:g, average:a, needs_improvement:n, total } = perfData.value
  if (total === 0) return 'background:#e5e7eb'
  let deg = 0
  const seg = (v, c) => { const d = (v/total)*360; const s = `${c} ${deg}deg ${deg+d}deg`; deg+=d; return s }
  return `background:conic-gradient(${seg(e,'#10B981')},${seg(g,'#14B8A6')},${seg(a,'#F59E0B')},${seg(n,'#EF4444')})`
})

// ── Attendance ────────────────────────────────────────────────────────────────
const heatColor = (r) => r >= 95 ? 'bg-green-500' : r >= 90 ? 'bg-yellow-500' : r > 0 ? 'bg-red-500' : 'bg-gray-300'
const weekRate  = (w, d) => (attendanceData.value.weekly_patterns?.[`week${w}`]?.[d]) ?? 0

// ── Attrition ─────────────────────────────────────────────────────────────────
const attritionSegments = computed(() => {
  const rb = attrition.value.reasons_breakdown ?? {}
  const colors = { voluntary:'#EF4444', involuntary:'#F59E0B', retirement:'#6B7280', other:'#94A3B8' }
  return Object.entries(rb).filter(([,v]) => v > 0).map(([k, v]) => ({ label: k.charAt(0).toUpperCase()+k.slice(1), value: v, color: colors[k]??'#94A3B8' }))
})
const attritionDonutStyle = computed(() => {
  if (!attritionSegments.value.length) return 'background:#e5e7eb'
  let deg = 0
  const segs = attritionSegments.value.map(s => { const d = s.value/100*360; const r = `${s.color} ${deg}deg ${deg+d}deg`; deg+=d; return r })
  return `background:conic-gradient(${segs.join(',')})`
})

// ── Work Reports ──────────────────────────────────────────────────────────────
const workReportMetrics = computed(() => {
  const t = workReports.value.totals ?? {}
  return [
    { label:'Total Calls',   value:safeNum(t.calls),          color:'text-teal-500' },
    { label:'Follow-ups',    value:safeNum(t.followups),       color:'text-blue-500' },
    { label:'Emails',        value:safeNum(t.emails),          color:'text-purple-500' },
    { label:'WhatsApp',      value:safeNum(t.whatsapp),        color:'text-green-500' },
    { label:'Interested',    value:safeNum(t.interested),      color:'text-emerald-500' },
    { label:'Not Interested',value:safeNum(t.not_interested),  color:'text-red-500' },
    { label:'Missed',        value:safeNum(t.missed),          color:'text-orange-500' },
    { label:'Voicemails',    value:safeNum(t.voicemails),      color:'text-indigo-500' },
    { label:'Reports Filed', value:safeNum(t.report_count),    color:'text-slate-500' },
  ]
})
const maxDeptCalls    = computed(() => Math.max(1, ...(workReports.value.dept_breakdown??[]).map(d => d.calls)))
const maxWrCalls      = computed(() => Math.max(1, ...(workReports.value.monthly_trend??[]).map(m => m.calls)))

// ── Skill Tests ───────────────────────────────────────────────────────────────
const skillTestBadges = computed(() => [
  { label:'Attempts',  value:skillTests.value.overview.total_attempts, bg:'bg-indigo-50', text:'text-indigo-700' },
  { label:'Completed', value:skillTests.value.overview.completed,      bg:'bg-teal-50',   text:'text-teal-700' },
  { label:'Avg Score', value:skillTests.value.overview.avg_score+'%',  bg:'bg-green-50',  text:'text-green-700' },
  { label:'Pass Rate', value:skillTests.value.overview.pass_rate+'%',  bg:'bg-blue-50',   text:'text-blue-700' },
  { label:'Passed',    value:skillTests.value.overview.passed,         bg:'bg-emerald-50',text:'text-emerald-700' },
])
const scoreDistBars = computed(() => {
  const s = skillTests.value.score_distribution
  return [
    { label:'Excellent (90%+)', value:s.excellent, color:'bg-green-500' },
    { label:'Good (75–89%)',    value:s.good,      color:'bg-teal-500' },
    { label:'Pass (60–74%)',    value:s.pass,      color:'bg-yellow-500' },
    { label:'Fail (<60%)',      value:s.fail,      color:'bg-red-500' },
  ]
})
const maxStAttempts = computed(() => Math.max(1, ...(skillTests.value.monthly_trend??[]).map(m => m.attempts)))

// ── Leave ─────────────────────────────────────────────────────────────────────
const leaveBadges = computed(() => {
  const o = leave.value.overview
  return [
    { label:'Total',         value:o.total,             bg:'bg-blue-50',   text:'text-blue-700' },
    { label:'Approved',      value:o.approved,          bg:'bg-green-50',  text:'text-green-700' },
    { label:'Pending',       value:o.pending,           bg:'bg-yellow-50', text:'text-yellow-700' },
    { label:'Rejected',      value:o.rejected,          bg:'bg-red-50',    text:'text-red-700' },
    { label:'Approval Rate', value:o.approval_rate+'%', bg:'bg-teal-50',   text:'text-teal-700' },
    { label:'Avg Days/Req',  value:o.avg_days,          bg:'bg-purple-50', text:'text-purple-700' },
    { label:'Avg Approval',  value:o.avg_approval_days+'d', bg:'bg-indigo-50', text:'text-indigo-700' },
    { label:'Cancelled',     value:o.cancelled,         bg:'bg-gray-100',  text:'text-gray-600' },
  ]
})
const maxLeaveType    = computed(() => Math.max(1, ...(leave.value.by_type??[]).map(t => t.requests)))
const maxLeaveDept    = computed(() => Math.max(1, ...(leave.value.by_dept??[]).map(d => d.requests)))
const maxLeaveMonthly = computed(() => Math.max(1, ...(leave.value.monthly_trend??[]).map(m => m.requests)))

// ── Department Performance ────────────────────────────────────────────────────
const deptPerformance = computed(() => {
  const dp = props.analytics.performanceMetrics?.department_performance ?? {}
  return Object.entries(dp).map(([name, d]) => ({ name, score: Math.round(d.average ?? 0) })).sort((a,b) => b.score-a.score)
})

// ── Forecast ──────────────────────────────────────────────────────────────────
const forecastBars = computed(() => {
  const growth  = props.analytics.employeeGrowth ?? []
  const current = forecast.value.current_count ?? 0
  const preds   = forecast.value.predictions ?? []
  const hist    = growth.slice(-6).map((m, i) => ({ label: m.month.split(' ')[0], count: m.total_employees, predicted: false }))
  const future  = preds.slice(0, 3).map((c, i) => {
    const d = new Date(); d.setMonth(d.getMonth() + i + 1)
    return { label: d.toLocaleString('default',{month:'short'}), count: c, predicted: true }
  })
  return [...hist, ...future]
})
const maxForecast = computed(() => Math.max(1, ...forecastBars.value.map(m => m.count)))

// ── Risk ──────────────────────────────────────────────────────────────────────
const riskItems = computed(() => [
  { label:'High Attrition Risk',   value:risk.value.high_attrition_risk,  unit:'employees', bg:isDark.value?'bg-red-900/30':'bg-red-50',    title:isDark.value?'text-red-300':'text-red-800',    sub:isDark.value?'text-red-400':'text-red-600',    icon:'text-red-500' },
  { label:'Performance Concerns',  value:risk.value.performance_concerns, unit:'employees', bg:isDark.value?'bg-yellow-900/30':'bg-yellow-50',title:isDark.value?'text-yellow-300':'text-yellow-800',sub:isDark.value?'text-yellow-400':'text-yellow-600',icon:'text-yellow-500' },
  { label:'Skill Gaps',            value:risk.value.skill_gaps,           unit:'competencies',bg:isDark.value?'bg-teal-900/30':'bg-teal-50',  title:isDark.value?'text-teal-300':'text-teal-800',  sub:isDark.value?'text-teal-400':'text-teal-600',   icon:'text-teal-500' },
  { label:'Pending Leave Risk',    value:risk.value.leaveRisk??0,         unit:'employees', bg:isDark.value?'bg-orange-900/30':'bg-orange-50',title:isDark.value?'text-orange-300':'text-orange-800',sub:isDark.value?'text-orange-400':'text-orange-600',icon:'text-orange-500' },
])

// ── Navigation ────────────────────────────────────────────────────────────────
const updateFilters = () => {
  router.get(route('organizational-analytics.index'), { timeRange: selectedTimeRange.value }, { preserveState: true, preserveScroll: true })
}
const refreshData = () => {
  router.reload({ only: ['analytics'], data: { timeRange: selectedTimeRange.value } })
}
</script>
