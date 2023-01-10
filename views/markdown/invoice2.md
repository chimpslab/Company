# Facture

Date de facture: {{date_facture}}

Numéro de facture: {{numero_facture}}

---

Client:

{{nom_client}}
{{adresse_client}}
{{ville_client}}, {{code_postal_client}}

---

Produits ou services achetés:

<table>
  <tr>
    <th>Nom</th>
    <th>Quantité</th>
    <th>Prix unitaire</th>
    <th>Prix total</th>
  </tr>
  {% for item in produits %}
    <tr>
      <td>{{ item.nom }}</td>
      <td>{{ item.quantité }}</td>
      <td>{{ item.prix_unitaire }}</td>
      <td>{{ item.prix_total }}</td>
    </tr>
  {% endfor %}
</table>

---

Sous-total: {{sous_total}}

Taxes: {{taxes}}

Total: {{total}}

Merci pour votre achat!
