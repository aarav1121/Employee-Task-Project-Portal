export enum EmployeeRole {
  TeamLead = 'Team Lead',
  Employee = 'Employee'
}


export interface Employee {
  id: string;
  name: string;
  email: string;
  role: EmployeeRole;
  department: string;
  avatar?: string;
}