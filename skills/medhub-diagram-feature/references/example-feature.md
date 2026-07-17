# Example: the two files for one feature

A worked, illustrative example for the (fictional but realistic) **Dynamic Forms** feature. Citations here are placeholders — in a real run every `source` / `sources` entry must point at actual `medhub` code you read. Copy the *shape*, not the line numbers.

## `src/data/features/dynamic-forms.ts`

```ts
import type { FeatureNode } from '../features'

const node: FeatureNode = {
  id: 'dynamic-forms',
  label: 'Dynamic Forms',
  description: 'Admin-defined forms rendered to end users; responses saved and surfaced to Evaluations.',
  // system defaults to 'medhub' — omit unless the feature lives in a sibling repo.
  entryPoints: ['/dynamicform.mh', 'app/controllers/DynamicFormController.php::render'],
  actors: ['DynamicFormController', 'DynamicFormGateway', 'MySQL', 'Evaluations'],
  dependsOn: [{ to: 'evaluations', label: 'publishes responses to' }],
}

export default node
```

## `src/data/flows/dynamic-forms.ts`

```ts
import type { FeatureFlowData } from '../flows'

const flow: FeatureFlowData = {
  key: 'medhub/dynamic-forms',
  actors: [
    { id: 'user', label: 'User (browser)', role: 'user' },
    { id: 'page', label: 'dynamicform.mh', role: 'layer' },
    { id: 'controller', label: 'DynamicFormController', role: 'layer' },
    { id: 'gateway', label: 'DynamicFormGateway', role: 'layer' },
    { id: 'db', label: 'MySQL', role: 'system' },
    { id: 'evaluations', label: 'Evaluations', role: 'layer' },
  ],
  steps: [
    { seq: 1, from: 'user', to: 'page', kind: 'action', label: 'Open form page' },
    { seq: 2, from: 'page', to: 'controller', kind: 'route', label: 'GET render(formId)' },
    {
      seq: 3,
      from: 'controller',
      to: 'gateway',
      kind: 'query',
      label: 'Load form definition',
      detail: {
        summary: 'Fetches the form and its fields.',
        sql: ['SELECT * FROM dynamic_forms WHERE id = :formId', 'SELECT * FROM dynamic_form_fields WHERE form_id = :formId ORDER BY sort_order'],
        sources: ['app/gateways/DynamicFormGateway.php:64'],
      },
    },
    {
      seq: 4,
      from: 'user',
      to: 'controller',
      kind: 'action',
      label: 'Submit responses',
      detail: {
        summary: 'Server-side required checks live in DynamicFormController::validate — the UI asterisks are cosmetic.',
        fields: [
          { name: 'patient_name', type: 'text', required: 'yes', validation: 'non-empty', source: 'DynamicFormController.php:141' },
          { name: 'visit_date', type: 'date', required: 'submit', validation: 'valid date, not future', source: 'DynamicFormController.php:149' },
          { name: 'notes', type: 'textarea', required: 'no', source: 'DynamicFormController.php:158' },
        ],
        rules: ['Unknown field keys are dropped, not rejected (DynamicFormController.php:170).'],
        sources: ['app/controllers/DynamicFormController.php:120-175'],
      },
    },
    {
      seq: 5,
      from: 'controller',
      to: 'gateway',
      kind: 'query',
      label: 'Persist responses',
      detail: { sql: ['INSERT INTO dynamic_form_responses (...) VALUES (...)'], sources: ['app/gateways/DynamicFormGateway.php:112'] },
    },
    {
      seq: 6,
      from: 'controller',
      to: 'evaluations',
      kind: 'cross-feature',
      crossFeatureTo: 'evaluations',
      label: 'Notify Evaluations of new responses',
      detail: {
        summary: 'Calls EvaluationIntake::onFormResponse — trace stops here; Evaluations is its own feature.',
        request: 'EvaluationIntake::onFormResponse(formId, responseId)',
        sources: ['app/services/Evaluations/EvaluationIntake.php:38'],
      },
    },
    { seq: 7, from: 'controller', to: 'page', kind: 'render', label: 'Redirect to confirmation' },
  ],
  note: 'visit_date is enforced server-side only on submit; drafts skip it. Unknown keys are silently dropped.',
}

export default flow
```

## Checklist mirrored by `npm run check`

- feature `id` === filename slug; `entryPoints` non-empty.
- every `dependsOn.to` and every `crossFeatureTo` is a real feature slug.
- a `cross-feature` step has a matching `dependsOn` edge.
- flow `key` is `medhub/<slug>`; every `from`/`to` is a declared actor id; `seq` runs 1..n.
- every `detail` cites `sources` (file:line); every `query` detail has `sql`.
