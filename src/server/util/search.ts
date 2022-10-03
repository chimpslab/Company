export interface OrganizationSearchOption {
    id: string
    query: string;
    page: number;
    sortorder: -1|1;

    sortfield: string;
    limit: number;
    count: boolean;
}