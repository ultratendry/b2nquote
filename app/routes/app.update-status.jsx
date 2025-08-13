// app/routes/app.update-status.jsx

import { json, redirect } from "@remix-run/node";
import { useLoaderData, useSearchParams, useFetcher } from "@remix-run/react";
import { prisma } from "../db.server";
import { authenticate } from "../shopify.server";
import { useState, useCallback } from "react";
import { Page, Layout, TextField, Select, InlineStack, Text, Button, Card, Modal } from "@shopify/polaris";

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
        { fullName: { contains: search } },
        { company: { contains: search } },
      ],
    }
    : {};

  const quotes = await prisma.quote.findMany({
    where,
    orderBy: { [sortBy]: sortOrder },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  const totalCount = await prisma.quote.count({ where });

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

export async function action({ request }) {
  const form = await request.formData();
  const actionType = form.get("_action");
  const id = form.get("id");

  const url = new URL(request.url);
  const currentParams = url.search;

  try {
    if (actionType === "delete") {
      await prisma.quote.delete({ where: { id } });
      return json({ success: true });
    }

    if (actionType === "updateStatus") {
      const status = form.get("status");
      await prisma.quote.update({ where: { id }, data: { status } });
      return json({ success: true });
    }
  } catch (error) {
    console.error("❌ Action error:", error);
    return json({ success: false, error: "Something went wrong" }, { status: 500 });
  }
}

export default function QuoteListPage() {
  const {
    quotes,
    totalCount,
    page,
    pageSize,
    search,
    sortBy,
    sortOrder,
  } = useLoaderData();

  const [searchParams, setSearchParams] = useSearchParams();
  const totalPages = Math.ceil(totalCount / pageSize);

  const [statusState, setStatusState] = useState(
    Object.fromEntries(quotes.map((q) => [q.id, q.status]))
  );

  const [dirtyStatusMap, setDirtyStatusMap] = useState({});

  const fetcher = useFetcher();

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

  const [modalActive, setModalActive] = useState(false);
  const [fileName, setFileName] = useState("quotes");

  const toggleModal = useCallback(() => setModalActive((active) => !active), []);

  const handleDownload = () => {
    // trigger download
    const url = `/export-csv?name=${encodeURIComponent(fileName)}.csv`;
    window.location.href = url;
    toggleModal(); // close modal
  };

  return (
    <>
      <Page title="Quotes"></Page>
      <Layout padding="4">
        <Layout.Section>
          <InlineStack align="space-between" gap="400" wrap>
            <TextField
              label="Search"
              labelHidden
              value={search}
              onChange={handleSearch}
              placeholder="Search name or company"
              autoComplete="off"
            />
            <a href="/export-csv" style={{ textDecoration: "none" }}>
              <Button variant="primary">Download CSV</Button>
            </a>

            {/* <Button onClick={toggleModal} variant="primary">
              Download CSV
            </Button>

            <Modal
              open={modalActive}
              onClose={toggleModal}
              title="Download CSV"
              primaryAction={{
                content: "Download",
                onAction: handleDownload,
              }}
              secondaryActions={[
                {
                  content: "Cancel",
                  onAction: toggleModal,
                },
              ]}
            >
              <Modal.Section>
                <TextField
                  label="File name"
                  value={fileName}
                  onChange={setFileName}
                  autoComplete="off"
                />
              </Modal.Section>
            </Modal> */}

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
                gridTemplateColumns:
                  ".6fr 1.2fr 1.5fr 1.5fr 2fr 1.4fr 1fr 1fr 1.2fr 1.7fr",
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
                  gridTemplateColumns:
                    ".7fr 1.2fr 1.5fr 1.5fr 2fr 1.4fr 1fr 1fr 1.2fr 1.7fr",
                  alignItems: "center",
                }}
              >
                <div>{quote.id || ""}</div>
                <div>{quote.fullName}</div>
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
                    onChange={(value) =>
                      handleStatusChange(quote.id, value, quote.status)
                    }
                  />
                </div>

                <div>
                  <InlineStack gap="100">
                    <fetcher.Form
                      method="post"
                      action="/app/update-status"
                      onSubmit={() => handleSave(quote.id)}
                    >
                      <input type="hidden" name="id" value={quote.id} />
                      <input
                        type="hidden"
                        name="status"
                        value={statusState[quote.id]}
                      />
                      <input
                        type="hidden"
                        name="_action"
                        value="updateStatus"
                      />
                      <Button
                        submit
                        size="slim"
                        variant="primary"
                        disabled={!dirtyStatusMap[quote.id]}
                      >
                        Save
                      </Button>
                    </fetcher.Form>

                    <form method="post" action="/app">
                      <input type="hidden" name="id" value={quote.id} />
                      <input type="hidden" name="_action" value="delete" />
                      <Button submit size="slim" destructive>
                        Delete
                      </Button>
                    </form>
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
