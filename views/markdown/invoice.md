{{#provider.image}}
![{{provider.legalName}} image]({{provider.image}})
{{/provider.image}}

# Invoice

| | | | |
| --- | --- | --- | --- |
| {{provider.legalName}}     |  | Date | {{invoice.date}} | | 
| {{provider.streetAddress}} |  | Invoice# | {{invoice.uidd }} | | 
| {{provider.countryCode}}-{{provider.postalCode}} {{provider.city}} |  | | | 
| VAT: {{provider.vatID}} | | Client | <a href="#" customer="{{customer.legalName}}"/> |
| {{provider.mail}} |  |  | {{customer.streetAddress}} |
|  |  |  | {{customer.countryCode}}-{{customer.postalCode}} {{customer.city}} |
|  |  |  | VAT: {{customer.vatID}} |

--- 

##### {{invoice.description}} 

| Description | Unit Price | Amount | Sub |
| --- | ---: | ---: | ---: |
{{#invoice.items}}
| {{description}} | {{price}} | {{amount}} | {{sub}} |
{{/invoice.items}}
|  |  |  |  |
|  |  | Sub Total | {{invoice.subtotal}} |
|  |  | VAT Rate | {{invoice.vatrate}} |
|  |  | VAT  | {{invoice.vat}} |
|  |  | **Total** | **{{invoice.total}}** |

--- 

<div class="w-100">
    <div class="d-flex justify-content-center">
        <b>Thank you from your friends at {{provider.name}}</b>
    </div>
</div>

{{generalconditions}}
{{#specialconditions}}
    {{condition}}
{{/specialconditions}}