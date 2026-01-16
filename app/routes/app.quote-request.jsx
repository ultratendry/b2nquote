// app/routes/app.quote-request.jsx

import { json } from "@remix-run/node";
import { useLoaderData, useSearchParams, useFetcher } from "@remix-run/react";
import { prisma } from "../db.server";
import { authenticate } from "../shopify.server";
import { useState, useEffect, useCallback } from "react";
import {
  Page,
  Layout,
  TextField,
  Select,
  InlineStack,
  Text,
  Button,
  Card
} from "@shopify/polaris";

// Loader
export const loader = async ({ request }) => {
  await authenticate.admin(request);

  const url = new URL(request.url);
  const search = url.searchParams.get("search") || "";
  const sortBy = url.searchParams.get("sortBy") || "createdAt";
  const sortOrder = url.searchParams.get("sortOrder") || "desc";
  const page = parseInt(url.searchParams.get("page") || "1");
  const pageSize = parseInt(url.searchParams.get("pageSize") || "10");

  const where = search
    ? {
        OR: [
          { name: { contains: search } },
          { company: { contains: search } },
        ],
      }
    : {};

  const quotes = await prisma.quoteRequest.findMany({
    where,
    orderBy: { [sortBy]: sortOrder },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  const totalCount = await prisma.quoteRequest.count({ where });

  return json({
    quotes,
    totalCount,
    page,
    pageSize,
    search,
    sortBy,
    sortOrder,
  });
};

// Action
export async function action({ request }) {
  // Only require authentication for non-fetcher (non-AJAX) requests
  const isAjax = request.headers.get("Sec-Fetch-Mode") === "cors";
  if (!isAjax) {
    try {
      await authenticate.admin(request);
    } catch (err) {
      // Instead of redirect, return a 401 JSON error for all unauthenticated
      return json({ success: false, error: "Not authenticated" }, { status: 401 });
    }
  }
  const form = await request.formData();
  const actionType = form.get("_action");
  const id = Number(form.get("id"));

  try {
    if (actionType === "delete") {
      await prisma.quoteRequest.delete({ where: { id } });
      // Always return JSON for AJAX and non-AJAX to prevent redirect
      return json({ success: true, id, message: "Record deleted successfully" });
    }
    if (actionType === "updateStatus") {
      const status = form.get("status");
      await prisma.quoteRequest.update({ where: { id }, data: { status } });
      return json({ success: true, id, status, message: "Status updated successfully" });
    }
  } catch (error) {
    console.error("❌ Action error:", error);
    return json({ success: false, error: error.message });
  }
}

// Component
export default function QuoteListPage() {
  const loaderData = useLoaderData();
  const [quotes, setQuotes] = useState(loaderData.quotes);
  const { totalCount, page, pageSize, search, sortBy, sortOrder } = loaderData;
  const [searchParams, setSearchParams] = useSearchParams();
  const totalPages = Math.ceil(totalCount / pageSize);

  const [statusState, setStatusState] = useState(
    Object.fromEntries(quotes.map((q) => [q.id, q.status]))
  );

  const [dirtyStatusMap, setDirtyStatusMap] = useState({});
  const fetcher = useFetcher();

  const [flashMessage, setFlashMessage] = useState("");

  const handleStatusChange = (id, value, originalStatus) => {
    setStatusState((prev) => ({ ...prev, [id]: value }));
    setDirtyStatusMap((prev) => ({
      ...prev,
      [id]: value !== originalStatus,
    }));
  };

  const handleSave = (id) => {
    setDirtyStatusMap((prev) => ({ ...prev, [id]: false }));
  };

  const handleSearch = (value) => {
    searchParams.set("search", value);
    searchParams.set("page", "1");
    setSearchParams(searchParams);
  };

  const handleSortChange = (value) => {
    const [field, order] = value.split("-");
    searchParams.set("sortBy", field);
    searchParams.set("sortOrder", order);
    setSearchParams(searchParams);
  };

  const handlePageChange = (newPage) => {
    searchParams.set("page", newPage.toString());
    setSearchParams(searchParams);
  };

  const handlePageSizeChange = (value) => {
    searchParams.set("pageSize", value);
    searchParams.set("page", "1");
    setSearchParams(searchParams);
  };

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data?.success) {
      const data = fetcher.data;

      // Delete
      if (data.id && data.message && fetcher.data._action === "delete") {
        setQuotes((prev) => prev.filter((q) => q.id !== data.id));

        setStatusState((prev) => {
          const copy = { ...prev };
          delete copy[data.id];
          return copy;
        });

        setFlashMessage(data.message);
        setTimeout(() => setFlashMessage(""), 3000);
      }

      // Update status
      if (data.id && data.status && data.message && fetcher.data._action === "updateStatus") {
        setFlashMessage(data.message);
        setTimeout(() => setFlashMessage(""), 3000);
      }
    }
  }, [fetcher.state, fetcher.data]);

  return (
    <>
      <Page title="Quotes" />
      <Layout padding="4">
        <Layout.Section>
          {flashMessage && (
            <div style={{ marginBottom: "16px", color: "green", fontWeight: 600 }}>
              {flashMessage}
            </div>
          )}

          <InlineStack align="space-between" gap="400" wrap>
            <TextField
              label="Search"
              labelHidden
              value={search}
              onChange={handleSearch}
              placeholder="Search name or company"
              autoComplete="off"
            />

            <Select
              label="Sort"
              labelHidden
              options={[
                { label: "Newest", value: "createdAt-desc" },
                { label: "Oldest", value: "createdAt-asc" },
                { label: "Updated At", value: "updatedAt-desc" },
                { label: "Name A-Z", value: "fullName-asc" },
                { label: "Name Z-A", value: "fullName-desc" },
              ]}
              onChange={handleSortChange}
              value={`${sortBy}-${sortOrder}`}
            />
          </InlineStack>

          <div style={{ height: "20px" }} />

          <Card padding="0">
            <div
              style={{
                padding: "16px",
                borderBottom: "1px solid #ccc",
                display: "grid",
                width: "100%",
                gridTemplateColumns: ".6fr 1.2fr 1.5fr 1.5fr 2fr 1.4fr 1fr 1fr 1.2fr 1.7fr",
                fontWeight: 600,
              }}
            >
              <div>ID</div>
              <div>Name</div>
              <div>Company</div>
              <div>Location</div>
              <div>Message</div>
              <div>Email</div>
              <div>Phone</div>
              <div>Qty</div>
              <div>Status</div>
              <div>Actions</div>
            </div>

            {quotes.length === 0 && (
              <div style={{ padding: "16px" }}>
                <Text>No quotes found.</Text>
              </div>
            )}

            {quotes.map((quote) => (
              <div
                key={quote.id}
                style={{
                  padding: "16px",
                  borderTop: "1px solid #eee",
                  display: "grid",
                  width: "100%",
                  gridTemplateColumns: ".7fr 1.2fr 1.5fr 1.5fr 2fr 1.4fr 1fr 1fr 1.2fr 1.7fr",
                  alignItems: "center",
                }}
              >
                <div>{quote.id}</div>
                <div>{quote.name}</div>
                <div>{quote.company || "—"}</div>
                <div>{quote.location || "—"}</div>
                <div>{quote.message || "—"}</div>
                <div>{quote.email}</div>
                <div>{quote.phone}</div>
                <div>{quote.quantity}</div>

                <div>
                  <Select
                    label="Change Status"
                    labelHidden
                    options={[
                      { label: "Pending", value: "pending" },
                      { label: "Approved", value: "approved" },
                      { label: "Rejected", value: "rejected" },
                    ]}
                    value={statusState[quote.id]}
                    onChange={(value) => handleStatusChange(quote.id, value, quote.status)}
                  />
                </div>

                <div>
                  <InlineStack gap="100">
                    <fetcher.Form method="post" action="/app/update-status">
                      <input type="hidden" name="id" value={quote.id} />
                      <input type="hidden" name="status" value={statusState[quote.id]} />
                      <input type="hidden" name="_action" value="updateStatus" />
                      <Button
                        submit
                        size="slim"
                        variant="primary"
                        disabled={!dirtyStatusMap[quote.id]}
                      >
                        Save
                      </Button>
                    </fetcher.Form>

                    <fetcher.Form method="post" action="/app/update-status">
                      <input type="hidden" name="id" value={quote.id} />
                      <input type="hidden" name="_action" value="delete" />
                      <Button
                        submit
                        size="slim"
                        destructive
                        onClick={(e) => {
                          if (!window.confirm("Are you sure you want to delete this quote?")) {
                            e.preventDefault();
                          }
                        }}
                      >
                        Delete
                      </Button>
                    </fetcher.Form>
                  </InlineStack>
                </div>
              </div>
            ))}
          </Card>

          {/* Pagination */}
          {totalCount > 0 && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "16px 8px",
                borderTop: "1px solid #eee",
              }}
            >
              <InlineStack align="start" gap="200">
                <Select
                  label="Rows per page"
                  labelHidden
                  options={[
                    { label: "10", value: "10" },
                    { label: "15", value: "15" },
                    { label: "20", value: "20" },
                    { label: "50", value: "50" },
                  ]}
                  onChange={handlePageSizeChange}
                  value={pageSize.toString()}
                />
                <Text>
                  {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, totalCount)} of {totalCount} rows
                </Text>
              </InlineStack>

              <InlineStack gap="100" align="end">
                <Button disabled={page === 1} onClick={() => handlePageChange(1)} size="slim">
                  «
                </Button>
                <Button disabled={page === 1} onClick={() => handlePageChange(page - 1)} size="slim">
                  ‹
                </Button>

                {[...Array(totalPages)].map((_, i) => {
                  const currentPage = i + 1;
                  if (
                    currentPage === 1 ||
                    currentPage === totalPages ||
                    Math.abs(currentPage - page) <= 1
                  ) {
                    return (
                      <Button
                        key={currentPage}
                        size="slim"
                        pressed={currentPage === page}
                        onClick={() => handlePageChange(currentPage)}
                      >
                        {currentPage}
                      </Button>
                    );
                  }
                  if (currentPage === page - 2 || currentPage === page + 2) {
                    return <span key={`ellipsis-${currentPage}`}>…</span>;
                  }
                  return null;
                })}

                <Button disabled={page === totalPages} onClick={() => handlePageChange(page + 1)} size="slim">
                  ›
                </Button>
                <Button disabled={page === totalPages} onClick={() => handlePageChange(totalPages)} size="slim">
                  »
                </Button>
              </InlineStack>
            </div>
          )}
        </Layout.Section>
      </Layout>
    </>
  );
}
