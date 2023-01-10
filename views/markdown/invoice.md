
![{{provider.legalName}} image]({{provider.image}})
![image](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAADCAIAAAA7l
jmRAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAY
SURBVBhXYwCC/2AAZYEoOAMs8Z+BgQEAXdcR7/Q1gssAAAAASUVORK5CYII=)

# Invoice

<div class="header" markdown>
| | | | |
| --- | --- | --- | --- |
| {{provider.legalName}}     |  | Date | {{invoice.date}} | | 
| {{provider.streetAddress}} |  | Invoice# | {{invoice.uidd }} | | 
| {{provider.countryCode}}-{{provider.postalCode}} {{provider.city}} |  | | | 
| VAT: {{provider.vatID}} | | Client | {{customer.legalName}} |
| {{provider.mail}} |  |  | {{customer.streetAddress}} |
|  |  |  | {{customer.countryCode}}-{{customer.postalCode}} {{customer.city}} |
|  |  |  | VAT: {{customer.vatID}} |
</div>
--- 

<div class="invoice" markdown>

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

</div>

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