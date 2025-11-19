<template>
    <div class="page-container">
        <h1 class="page-title">Annual Billing</h1>
        
        <div class="tabs-container">
            <button class="tab-btn active">Annual Billing</button>
            <button class="tab-btn">Search</button>
        </div>
        
        <div class="filters-section">
            <select class="filter-select">
                <option>Select Year</option>
                <option>2024</option>
                <option>2023</option>
                <option>2022</option>
            </select>
            <button class="search-btn">Search</button>
        </div>
        
        <div class="table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Q #</th>
                        <th>IMO NUMBER</th>
                        <th>VESSEL</th>
                        <th>PRODUCT</th>
                        <th>PRODUCT TYPE</th>
                        <th>BILL TO CLIENT</th>
                        <th>BILLING EMAIL</th>
                        <th>ISSUE TYPE</th>
                        <th>CERTIFICATE ISSUE</th>
                        <th>CERTIFICATE EXPIRY</th>
                        <th>ACTION</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>92475</td>
                        <td>9488860</td>
                        <td><a href="#" class="vessel-link">ALHEIRO OLDENDORFF</a></td>
                        <td>NLC Adult</td>
                        <td>21-225</td>
                        <td>Oldendorff Carriers GmbH & Co. KG</td>
                        <td>xy@axy.com</td>
                        <td>Initial</td>
                        <td>18 Dec 2024</td>
                        <td>23 Dec 2025</td>
                        <td>
                            <button class="action-btn">
                                <i class="fas fa-external-link-alt"></i> Edit
                            </button>
                        </td>
                    </tr>
                    <tr>
                        <td>92626</td>
                        <td>9098910</td>
                        <td><a href="#" class="vessel-link">ALHEIRO OLDENDORFF</a></td>
                        <td>NLC Additional Inspection</td>
                        <td>21-664</td>
                        <td>Oldendorff Carriers GmbH & Co. KG</td>
                        <td>abc@xyz.com</td>
                        <td>Renewal</td>
                        <td>18 Dec 2024</td>
                        <td>19 Dec 2025</td>
                        <td>
                            <button class="action-btn">
                                <i class="fas fa-external-link-alt"></i> Edit
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
            
            <div class="btn-container">
                <button class="approve-btn">
                    <i class="fas fa-check"></i>
                    Approve
                </button>
            </div>
        </div>
    </div>
</template>
<style scoped>
        body {
            background-color: #f8f9fa;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        }
        
        .page-container {
            padding: 30px;
            max-width: 1600px;
            margin: 0 auto;
        }
        
        .page-title {
            font-size: 24px;
            font-weight: 600;
            color: #212529;
            margin-bottom: 25px;
        }
        
        .tabs-container {
            display: flex;
            gap: 10px;
            margin-bottom: 30px;
        }
        
        .tab-btn {
            padding: 10px 24px;
            border: none;
            background: white;
            color: #6c757d;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            border-radius: 6px;
            transition: all 0.3s ease;
        }
        
        .tab-btn.active {
            background: #0d6efd;
            color: white;
        }
        
        .tab-btn:hover:not(.active) {
            background: #e9ecef;
        }
        
        .filters-section {
            display: flex;
            gap: 15px;
            margin-bottom: 30px;
            align-items: center;
        }
        
        .filter-select {
            padding: 10px 16px;
            border: 1px solid #ced4da;
            border-radius: 6px;
            font-size: 14px;
            color: #495057;
            background: white;
            min-width: 200px;
            cursor: pointer;
        }
        
        .search-btn {
            padding: 10px 30px;
            background: white;
            border: 1px solid #ced4da;
            border-radius: 6px;
            color: #495057;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .search-btn:hover {
            background: #e9ecef;
        }
        
        .table-container {
            background: white;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
            overflow: hidden;
        }
        
        .data-table {
            width: 100%;
            margin-bottom: 0;
        }
        
        .data-table thead {
            background-color: #f8f9fa;
        }
        
        .data-table thead th {
            padding: 16px 12px;
            font-size: 12px;
            font-weight: 600;
            color: #6c757d;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-bottom: 2px solid #dee2e6;
            white-space: nowrap;
        }
        
        .data-table tbody td {
            padding: 16px 12px;
            font-size: 14px;
            color: #495057;
            border-bottom: 1px solid #f1f3f5;
            vertical-align: middle;
        }
        
        .data-table tbody tr:hover {
            background-color: #f8f9fa;
        }
        
        .vessel-link {
            color: #0d6efd;
            text-decoration: none;
            font-weight: 500;
        }
        
        .vessel-link:hover {
            text-decoration: underline;
        }
        
        .action-btn {
            background: none;
            border: none;
            color: #0d6efd;
            cursor: pointer;
            padding: 4px 8px;
            font-size: 13px;
            display: inline-flex;
            align-items: center;
            gap: 5px;
        }
        
        .action-btn:hover {
            color: #0a58ca;
        }
        
        .approve-btn {
            padding: 8px 24px;
            background: white;
            border: 1px solid #ced4da;
            border-radius: 20px;
            color: #495057;
            font-size: 14px;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            transition: all 0.3s ease;
            margin-top: 20px;
        }
        
        .approve-btn:hover {
            background: #0d6efd;
            color: white;
            border-color: #0d6efd;
        }
        
        .approve-btn i {
            font-size: 12px;
        }
        
        .btn-container {
            text-align: center;
            padding: 20px;
        }
    </style>