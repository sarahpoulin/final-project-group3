/**
 * E2E navigation tests. Require the app to be running (e.g. `pnpm dev`).
 * baseUrl is set in cypress.config.ts (default http://localhost:3000).
 */

describe("Navigation (header)", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("shows home heading on initial load", () => {
    cy.get("h1").should("contain", "Shoreline Woodworks");
  });

  it("navigates to Projects when clicking the Projects link and shows Projects heading", () => {
    cy.get("nav").find("a").contains("Projects").click();

    cy.location("pathname").should("eq", "/projects");
    cy.get("h1").should("have.text", "Projects");
  });

  it("navigates to About when clicking the About link and shows About heading", () => {
    cy.get("nav").find("a").contains("About").click();

    cy.location("pathname").should("eq", "/about");
    cy.get("h1").should("have.text", "About");
  });

  it("navigates to Contact when clicking the Contact link and shows Contact heading", () => {
    cy.get("nav").find("a").contains("Contact").click();

    cy.location("pathname").should("eq", "/contact");
    cy.get("h1").should("have.text", "Contact");
  });
});
