import type { StructureResolver } from "sanity/structure";
import { requestStatuses } from "./schema/custom-request";

// The left-hand menu in the Studio
export const structure: StructureResolver = (S) =>
  S.list()
    .title("Funkypressons")
    .items([
      S.listItem()
        .title("Custom requests")
        .child(
          S.list()
            .title("Custom requests")
            .items([
              ...requestStatuses.map((status) =>
                S.listItem()
                  .title(status.title)
                  .child(
                    S.documentList()
                      .title(status.title)
                      .schemaType("customRequest")
                      .filter('_type == "customRequest" && status == $status')
                      .params({ status: status.value })
                      .defaultOrdering([{ field: "submittedAt", direction: "desc" }]),
                  ),
              ),
              S.divider(),
              S.documentTypeListItem("customRequest").title("All requests"),
            ]),
        ),
      S.divider(),
      S.listItem()
        .title("Designs")
        .child(
          S.list()
            .title("Designs")
            .items([
              S.documentTypeListItem("design").title("All designs"),
              S.listItem()
                .title("In the shop")
                .child(S.documentList().title("In the shop").schemaType("design").filter('_type == "design" && forSale == true')),
              S.listItem()
                .title("Gallery only")
                .child(S.documentList().title("Gallery only").schemaType("design").filter('_type == "design" && forSale != true')),
            ]),
        ),
      S.divider(),
      S.listItem().title("Site settings").child(S.document().schemaType("siteSettings").documentId("siteSettings")),
    ]);
