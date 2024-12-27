import React from "react";
import {Table, TableProps} from "antd";
import {ColumnsType} from "antd/es/table";

interface DataTableProps<T> extends TableProps<T> {
    dataSource: T[];
    columns: ColumnsType<T>;
    loading: boolean;
}

export const DataTable = <T extends object>({
                                                dataSource,
                                                loading,
                                                columns,
                                                ...props
                                            }: DataTableProps<T>) => (
    <Table
        {...props}
        size="small"
        pagination={{hideOnSinglePage: true}}
        dataSource={dataSource}
        loading={loading}
        columns={columns}
    />
);
