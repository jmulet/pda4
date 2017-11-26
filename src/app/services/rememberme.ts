export class RememberMe {
    private selectedGroup: any;
    private selectedStudent: any;
    private selectedFilter: string;
    private selectedDate: Date;

    constructor() {
      this.selectedGroup = null;
      this.selectedStudent = null;
      this.selectedFilter = '';
      this.selectedDate = new Date();
    }

    public setSelectedGroup(g: any): void {
      this.selectedGroup = g;
    }

    public setSelectedStudent(s: any): void {
      this.selectedStudent = s;
    }

    public setSelectedFilter(f: string): void {
      this.selectedFilter = f;
    }

    public setSelectedDate(d: Date): void {
      this.selectedDate = d;
    }

    public getSelectedGroup(): any {
        return this.selectedGroup || {};
    }

    public getSelectedStudent(): any {
        return this.selectedStudent || {};
    }

    public getSelectedFilter(): string {
        return this.selectedFilter || '';
    }

    public getSelectedDate(): Date {
        return this.selectedDate || new Date();
    }

}
