# n8n-nodes-mews

> **[Velocity BPA Licensing Notice]**
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

A comprehensive n8n community node for Mews, a cloud-native property management system (PMS) for the hospitality industry. This node integrates with the Mews Connector API to enable workflow automation for reservations, guest management, billing, housekeeping, and operations across 5,000+ hospitality properties in 85+ countries.

![n8n](https://img.shields.io/badge/n8n-community--node-green)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)
![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)

## Features

- **10 Resource Categories** with 60+ operations for complete Mews integration
- **Dual-Token Authentication** supporting Client Token and Access Token
- **Multi-Environment Support** for Production and Demo APIs
- **Cursor-Based Pagination** for efficient handling of large datasets
- **Comprehensive Error Handling** with detailed Mews API error messages
- **Multi-Currency Support** across all payment and billing operations
- **Extent Control** for optimizing API response payloads

## Installation

### Community Nodes (Recommended)

1. Go to **Settings > Community Nodes** in your n8n instance
2. Select **Install**
3. Enter `n8n-nodes-mews` in the package name field
4. Accept the risks and click **Install**

### Manual Installation

```bash
# Navigate to your n8n installation
cd ~/.n8n

# Install the package
npm install n8n-nodes-mews

# Restart n8n
```

### Development Installation

```bash
# Clone the repository
git clone https://github.com/Velocity-BPA/n8n-nodes-mews.git
cd n8n-nodes-mews

# Install dependencies
npm install

# Build the project
npm run build

# Create symlink to n8n custom nodes
mkdir -p ~/.n8n/custom
ln -s $(pwd) ~/.n8n/custom/n8n-nodes-mews

# Restart n8n
```

## Credentials Setup

The Mews node requires dual-token authentication:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Client Token | String | Yes | Integration identifier from Mews Partner Portal |
| Access Token | String | Yes | Property-specific token provided by each property |
| Environment | Select | Yes | Choose Production or Demo |

### Obtaining Credentials

1. **Client Token**: Register as a Mews integration partner at [Mews Developer Portal](https://www.mews.com/en/products/open-api)
2. **Access Token**: Each property provides their unique access token for your integration

## Resources & Operations

### Reservation

Manage hotel reservations with full lifecycle support.

| Operation | Description |
|-----------|-------------|
| Get All | List reservations with filters (state, dates, customer, service) |
| Get | Retrieve a single reservation by ID |
| Create | Book a new reservation |
| Update | Modify reservation details |
| Cancel | Cancel a reservation with reason |
| Confirm | Confirm an optional/provisional reservation |
| Get Items | Retrieve items attached to a reservation |
| Add Item | Add products/services to a reservation |
| Assign Space | Assign a room to a reservation |

### Customer

Manage guest profiles and identity documents.

| Operation | Description |
|-----------|-------------|
| Get All | List customers with pagination |
| Get | Retrieve customer by ID |
| Search | Search by name, email, or phone |
| Create | Create a new customer profile |
| Update | Update customer details |
| Merge | Merge duplicate customer profiles |
| Get Identity Documents | List passport/ID documents |
| Add Identity Document | Add a new identity document |

### Space (Rooms)

Manage rooms, availability, and room status.

| Operation | Description |
|-----------|-------------|
| Get All | List all rooms/spaces |
| Get | Retrieve space by ID |
| Get Availability | Check room availability for date range |
| Get Blocks | Get room blocks/restrictions |
| Get Categories | List room types/categories |
| Update State | Update room status (Clean, Dirty, Inspected, etc.) |

### Service

Manage reservable and orderable services.

| Operation | Description |
|-----------|-------------|
| Get All | List all services |
| Get | Retrieve service by ID |
| Get Availability | Check service availability |
| Get Products | List products for a service |
| Get Pricing | Get service pricing |
| Get Rates | Get rate configurations |

### Order

Manage service orders and product orders.

| Operation | Description |
|-----------|-------------|
| Get All | List all orders |
| Get | Retrieve order by ID |
| Create | Create a new service order |
| Update | Modify order details |
| Cancel | Cancel an order |
| Add Items | Add items to an existing order |
| Process | Process/fulfill an order |

### Payment

Process payments and manage card preauthorizations.

| Operation | Description |
|-----------|-------------|
| Get All | List all payments |
| Get | Retrieve payment by ID |
| Create | Process a new payment |
| Get Commands | List pending payment commands |
| Add Preauthorization | Place a hold on a credit card |
| Charge Preauthorization | Capture held funds |
| Cancel Preauthorization | Release a card hold |

### Bill

Manage invoices, receipts, and bill items.

| Operation | Description |
|-----------|-------------|
| Get All | List all bills |
| Get | Retrieve bill by ID |
| Create | Create a new bill |
| Close | Finalize and close a bill |
| Get Items | List bill line items |
| Add Payment | Apply payment to a bill |
| Move Items | Transfer items between bills |

### Outlet

Manage outlets like restaurants, spa, and retail.

| Operation | Description |
|-----------|-------------|
| Get All | List all outlets |
| Get | Retrieve outlet by ID |
| Get Items | Get items from outlet transactions |
| Create Bill | Create a bill for outlet purchases |

### Housekeeping

Manage room cleaning tasks and status.

| Operation | Description |
|-----------|-------------|
| Get Space States | Get housekeeping status for rooms |
| Update Space State | Update room cleaning status |
| Get Tasks | List housekeeping tasks |
| Create Task | Create a new cleaning task |
| Complete Task | Mark a task as complete |
| Assign Task | Assign task to an attendant |

### Report

Generate operational and financial reports.

| Operation | Description |
|-----------|-------------|
| Get Manager Report | Daily operational summary |
| Get Occupancy Report | Occupancy statistics and trends |
| Get Revenue Report | Revenue breakdown by category |
| Get Activity Report | Guest activity summary |
| Export Data | Bulk data export |

## Usage Examples

### Get Today's Reservations

```json
{
  "resource": "reservation",
  "operation": "getAll",
  "filters": {
    "startUtc": "{{ $today }}",
    "endUtc": "{{ $today }}",
    "states": ["Confirmed", "Started"]
  }
}
```

### Create a Customer

```json
{
  "resource": "customer",
  "operation": "create",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phone": "+1-555-0123",
  "nationalityCode": "US"
}
```

### Process a Payment

```json
{
  "resource": "payment",
  "operation": "create",
  "accountId": "{{ $json.billId }}",
  "amount": 150.00,
  "currency": "USD",
  "type": "CreditCard"
}
```

### Update Room Status

```json
{
  "resource": "housekeeping",
  "operation": "updateSpaceState",
  "spaceId": "{{ $json.roomId }}",
  "state": "Clean"
}
```

## Mews API Concepts

### Extent Parameter

Many operations support an `Extent` parameter to control which related data is returned:

- **includeCustomers**: Include guest profile data
- **includeSpaces**: Include room/space information
- **includeServices**: Include service details
- **includeItems**: Include line items
- **includePayments**: Include payment records

### Pagination

The node handles cursor-based pagination automatically when using "Get All" operations with the "Return All" option. For manual pagination, use the Limitation parameters:

- **Count**: Number of records per page (max 1000)
- **Cursor**: Pagination cursor from previous response

### Date Handling

All dates are handled in UTC format (ISO 8601). The API uses:
- `StartUtc` / `EndUtc` for date ranges
- `CreatedUtc` / `UpdatedUtc` for audit timestamps

## Error Handling

The node provides detailed error messages from the Mews API:

| Error Code | Description |
|------------|-------------|
| 400 | Invalid request or validation error |
| 401 | Authentication failed (check tokens) |
| 403 | Insufficient permissions |
| 404 | Resource not found |
| 429 | Rate limited (10,000 req/15 min) |

Enable "Continue on Fail" for batch operations to handle errors gracefully.

## Security Best Practices

1. **Store credentials securely** using n8n's credential management
2. **Use Demo environment** for testing and development
3. **Implement rate limiting** in workflows processing large datasets
4. **Rotate access tokens** periodically as per property policies
5. **Log minimally** to avoid exposing guest PII

## Development

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Watch mode for development
npm run dev
```

## Author

**Velocity BPA**
- Website: [velobpa.com](https://velobpa.com)
- GitHub: [Velocity-BPA](https://github.com/Velocity-BPA)

## Licensing

This n8n community node is licensed under the **Business Source License 1.1**.

### Free Use
Permitted for personal, educational, research, and internal business use.

### Commercial Use
Use of this node within any SaaS, PaaS, hosted platform, managed service, or paid automation offering requires a commercial license.

For licensing inquiries:
**licensing@velobpa.com**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

All contributions must comply with the BSL 1.1 license terms.

## Support

- **Issues**: [GitHub Issues](https://github.com/Velocity-BPA/n8n-nodes-mews/issues)
- **Documentation**: [Mews API Docs](https://mews-systems.gitbook.io/connector-api/)
- **Community**: [n8n Community Forum](https://community.n8n.io/)

## Acknowledgments

- [Mews](https://www.mews.com/) for their comprehensive hospitality API
- [n8n](https://n8n.io/) for the workflow automation platform
- The n8n community for their continuous support and feedback
