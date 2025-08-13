import { Link, Outlet, useLoaderData, useRouteError } from "@remix-run/react";
import { boundary } from "@shopify/shopify-app-remix/server";
import { AppProvider } from "@shopify/shopify-app-remix/react";
import { NavMenu } from "@shopify/app-bridge-react";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";
import { authenticate } from "../shopify.server";
import { json, redirect } from "@remix-run/node";
import { prisma } from "../db.server";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return { apiKey: process.env.SHOPIFY_API_KEY || "" };
};

export async function action({ request }) {
  const form = await request.formData();
  const actionType = form.get("_action");
  const id = form.get("id");

  try {
    if (actionType === "delete") {
      await prisma.quote.delete({ where: { id } });
      return json({ success: true });
    }

    if (actionType === "updateStatus") {
      const status = form.get("status");
      await prisma.quote.update({ where: { id }, data: { status } });
      return json({ success: true }); // ✅ Stay on same page
    }

  } catch (error) {
    console.error("❌ Action error:", error);
    return json({ success: false, error: "Something went wrong" }, { status: 500 });
  }
}

// ✅ This is the only default export you should keep
export default function App() {
  const { apiKey } = useLoaderData();

  return (
    <AppProvider isEmbeddedApp apiKey={apiKey}>
      <NavMenu>
        <Link to="/app/update-status" rel="home">
          Home
        </Link>
        <Link to="/app/additional">Additional page</Link>
      </NavMenu>
      <Outlet />
    </AppProvider>
  );
}

export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
