@props(['url'])
<tr>
<td class="header">
<a href="{{ $url }}" style="display: inline-block;">
@if (trim($slot) === 'Xonobics')
Xonobics
@else
{!! $slot !!}
@endif
</a>
</td>
</tr>
