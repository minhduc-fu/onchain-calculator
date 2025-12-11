// components/sample.tsx
"use client"

/**
 * ============================================================================
 * IOTA ON-CHAIN CALCULATOR UI
 * ============================================================================
 */

import React, { ChangeEvent } from "react"
import { useCurrentAccount } from "@iota/dapp-kit"
import { useContract } from "@/hooks/useContract"
import { Button, Container, Flex, Heading, Text } from "@radix-ui/themes"
import ClipLoader from "react-spinners/ClipLoader"

const SampleIntegration = () => {
  const currentAccount = useCurrentAccount()
  const { input, setInput, data, state, actions, objectId, objectExists, hasValidData } =
    useContract()

  const isConnected = !!currentAccount

  const handleNumberChange =
    (field: "a" | "b") =>
    (e: ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value
      const num = raw === "" ? 0 : Number(raw)
      setInput((prev) => ({
        ...prev,
        [field]: Number.isNaN(num) ? 0 : num,
      }))
    }

  const handleOpChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const op = e.target.value as typeof input.op
    setInput((prev) => ({ ...prev, op }))
  }

  if (!isConnected) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem",
        }}
      >
        <div style={{ maxWidth: "500px", width: "100%" }}>
          <Heading size="6" style={{ marginBottom: "1rem" }}>
            IOTA On-chain Calculator dApp
          </Heading>
          <Text>Please connect your IOTA wallet to use the calculator.</Text>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: "100vh", padding: "1rem", background: "var(--gray-a2)" }}>
      <Container style={{ maxWidth: "900px", margin: "0 auto" }}>
        <Heading size="6" style={{ marginBottom: "2rem", textAlign: "center" }}>
          IOTA On-chain Calculator dApp
        </Heading>

        {/* Input panel */}
        <div
          style={{
            marginBottom: "1.5rem",
            padding: "1.5rem",
            background: "var(--gray-a3)",
            borderRadius: "12px",
          }}
        >
          <Text size="3" style={{ display: "block", marginBottom: "1rem" }}>
            Enter your calculation. The operation will be executed on-chain in a Move smart
            contract, and the result is stored as a Calculation object.
          </Text>

          <Flex gap="2" align="center" wrap="wrap">
            <input
              type="number"
              value={input.a}
              onChange={handleNumberChange("a")}
              style={{
                width: "120px",
                padding: "0.4rem 0.6rem",
                borderRadius: "6px",
                border: "1px solid var(--gray-a7)",
                background: "var(--gray-1)",
                color: "inherit",
              }}
            />

            <select
              value={input.op}
              onChange={handleOpChange}
              style={{
                padding: "0.4rem 0.6rem",
                borderRadius: "6px",
                border: "1px solid var(--gray-a7)",
                background: "var(--gray-1)",
                color: "inherit",
              }}
            >
              <option value="+">+</option>
              <option value="-">-</option>
              <option value="×">×</option>
              <option value="÷">÷</option>
            </select>

            <input
              type="number"
              value={input.b}
              onChange={handleNumberChange("b")}
              style={{
                width: "120px",
                padding: "0.4rem 0.6rem",
                borderRadius: "6px",
                border: "1px solid var(--gray-a7)",
                background: "var(--gray-1)",
                color: "inherit",
              }}
            />

            <Button
              size="3"
              onClick={actions.calculate}
              disabled={state.isLoading || state.isPending}
            >
              {state.isLoading || state.isPending ? (
                <>
                  <ClipLoader size={16} style={{ marginRight: "8px" }} />
                  Calculating...
                </>
              ) : (
                "Calculate on-chain"
              )}
            </Button>
          </Flex>

          {state.error && (
            <div
              style={{
                marginTop: "1rem",
                padding: "1rem",
                background: "var(--red-a3)",
                borderRadius: "8px",
              }}
            >
              <Text style={{ color: "var(--red-11)" }}>
                Error: {(state.error as Error)?.message || String(state.error)}
              </Text>
            </div>
          )}
        </div>

        {/* Result panel */}
        {objectId && (
          <div>
            {state.isLoading && !data ? (
              <Text>Loading calculation result...</Text>
            ) : state.error ? null : objectExists && !hasValidData ? (
              <div
                style={{
                  padding: "1rem",
                  background: "var(--yellow-a3)",
                  borderRadius: "8px",
                }}
              >
                <Text style={{ color: "var(--yellow-11)" }}>
                  Calculation object found but structure is invalid. Please verify the
                  contract.
                </Text>
                <Text
                  size="1"
                  style={{
                    color: "var(--gray-a11)",
                    marginTop: "0.5rem",
                    display: "block",
                  }}
                >
                  Calculation ID: {objectId}
                </Text>
              </div>
            ) : data ? (
              <div>
                <div
                  style={{
                    marginBottom: "1rem",
                    padding: "1.5rem",
                    background: "var(--gray-a3)",
                    borderRadius: "12px",
                    textAlign: "center",
                  }}
                >
                  <Text size="2" style={{ display: "block", marginBottom: "0.5rem" }}>
                    Result
                  </Text>
                  <Heading size="7" style={{ marginBottom: "0.5rem" }}>
                    {data.a} {data.op} {data.b} = {data.result}
                  </Heading>
                  <Text
                    size="1"
                    style={{
                      color: "var(--gray-a11)",
                      display: "block",
                    }}
                  >
                    Calculation ID: {objectId}
                  </Text>
                  <Text
                    size="1"
                    style={{
                      color: "var(--gray-a11)",
                      display: "block",
                      marginTop: "0.25rem",
                    }}
                  >
                    Owner: {data.owner}
                  </Text>
                </div>

                {state.hash && (
                  <div
                    style={{
                      marginTop: "0.5rem",
                      padding: "1rem",
                      background: "var(--gray-a3)",
                      borderRadius: "8px",
                    }}
                  >
                    <Text size="1" style={{ display: "block", marginBottom: "0.5rem" }}>
                      Last Transaction Hash
                    </Text>
                    <Text
                      size="2"
                      style={{ fontFamily: "monospace", wordBreak: "break-all" }}
                    >
                      {state.hash}
                    </Text>
                    {state.isConfirmed && (
                      <Text
                        size="2"
                        style={{
                          color: "green",
                          marginTop: "0.5rem",
                          display: "block",
                        }}
                      >
                        Transaction confirmed!
                      </Text>
                    )}
                  </div>
                )}

                <Button
                  variant="soft"
                  size="2"
                  onClick={actions.clearSession}
                  style={{ marginTop: "1rem" }}
                  disabled={state.isLoading || state.isPending}
                >
                  Clear Session
                </Button>
              </div>
            ) : null}
          </div>
        )}
      </Container>
    </div>
  )
}

export default SampleIntegration
