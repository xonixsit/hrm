@props(['url'])
<tr>
<td class="header">
<a href="{{ $url }}" style="display: inline-block;">
@if (trim($slot) === 'E-Tax Planner')
E-Tax Planner
@else
{!! $slot !!}
@endif
</a>
</td>
</tr>
