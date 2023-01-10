
![{{provider.legalName}} image]({{provider.image}})
![image](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAADCAIAAAA7l
jmRAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAY
SURBVBhXYwCC/2AAZYEoOAMs8Z+BgQEAXdcR7/Q1gssAAAAASUVORK5CYII=)

# Invoice
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

<div class="w-100">
    <div class="d-flex justify-content-center">
        Thank you from your friends at {{provider.name}}
    </div>
</div>

{{generalconditions}}
{{#specialconditions}}
    {{condition}}
{{/specialconditions}}