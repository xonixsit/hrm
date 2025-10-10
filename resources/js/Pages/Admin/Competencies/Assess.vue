<template>
  <div>
    <h1>Assess Employee Competencies</h1>
    <form @submit.prevent="submit">
      <div>
        <label for="employee">Employee</label>
        <select id="employee" v-model="form.employee_id">
          <option v-for="employee in employees" :key="employee.id" :value="employee.id">{{ employee.name }}</option>
        </select>
      </div>
      <div>
        <label for="competency">Competency</label>
        <select id="competency" v-model="form.competency_id">
          <option v-for="competency in competencies" :key="competency.id" :value="competency.id">{{ competency.name }}</option>
        </select>
      </div>
      <div>
        <label for="rating">Rating</label>
        <input id="rating" type="number" v-model="form.rating" min="1" max="5" />
      </div>
      <div>
        <label for="comments">Comments</label>
        <textarea id="comments" v-model="form.comments"></textarea>
      </div>
      <button type="submit" :disabled="form.processing">Submit Assessment</button>
    </form>

    <hr class="my-8" />

    <h2>Existing Assessments</h2>
    <table>
      <thead>
        <tr>
          <th>Employee</th>
          <th>Competency</th>
          <th>Rating</th>
          <th>Comments</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="assessment in assessments" :key="assessment.id">
          <td>{{ assessment.employee.name }}</td>
          <td>{{ assessment.competency.name }}</td>
          <td>{{ assessment.rating }}</td>
          <td>{{ assessment.comments }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { useForm } from '@inertiajs/vue3';

defineProps({
  employees: Array,
  competencies: Array,
  assessments: Array,
});

const form = useForm({
  employee_id: null,
  competency_id: null,
  rating: null,
  comments: '',
});

const submit = () => {
  form.post(route('employee-competencies.store'));
};
</script>