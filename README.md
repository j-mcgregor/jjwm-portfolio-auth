# OddJob API

**Models**

- USER
  - firstName - string
  - lastName - string
  - DOB - string
  - role - string
  - admin - boolean
  - children - array
  - tasks - array
- ACCOUNT
  - userId - ID
  - balance - float
  - transactions - array
- TRANSACTION
  - fromUserId - ID
  - fromAccountId - ID
  - toUserId - ID
  - toAccountId - ID
  - value - float
- TASKS
  - value - float
  - assignedBy - ID
  - assignedTo - ID
  - name - string
  - description - string
  - completed - boolean
  - verified - boolean
