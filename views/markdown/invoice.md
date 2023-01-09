
![{{provider.legalName}} image]({{provider.image}})

**Invoice**

| | | | |
| --- | --- | --- | --- |
| {{provider.legalName}}     |  | Date | {{invoice.date}} | | 
| {{provider.streetAddress}} |  | Invoice# | {{invoice.uidd }} | | 
| {{provider.countryCode}}-{{provider.postalCode}} {{provider.city}} |  | | | 
| VAT: {{provider.vatID}} | | Client | {{customer.legalName}} |
| {{provider.mail}} |  |  | {{customer.streetAddress}} |
|  |  |  | {{customer.countryCode}}-{{customer.postalCode}} {{customer.city}} |
|  |  |  | VAT: {{customer.vatID}} |


| Description | Unit Price | Amount | Sub |
| --- | --- | --- | --- |
| {{invoice.description}} |  | |
{{#items}}
| {{description}} | {{price}} | {{amount}} | {{sub}} {{currency}} |
{{/items}}
|  |  |  |  |
|  |  | Sub Total | {{subtotal}} |
|  |  | VAT Rate | {{vatrate}} |
|  |  | VAT  | {{vat}} {{currency}} |
|  |  | Total | {{total}} {{currency}} |

<div class="position-relative w-100">
    <span class="start-50 translate-50">
        Thank you from your friends at {{provider.name}}
    </span>
</div>

{{generalconditions}}
{{#specialconditions}}
    {{condition}}
{{/specialconditions}}