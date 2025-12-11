// hooks/useContract.ts
"use client"

/**
 * ============================================================================
 * IOTA ON-CHAIN CALCULATOR CONTRACT HOOK (simplified & robust)
 * ============================================================================
 */

import { useEffect, useState } from "react"
import {
  useCurrentAccount,
  useIotaClient,
  useIotaClientQuery,
  useSignAndExecuteTransaction,
} from "@iota/dapp-kit"
import { Transaction } from "@iota/iota-sdk/transactions"
import type { IotaObjectData } from "@iota/iota-sdk/client"

export const CONTRACT_MODULE = "calc"
export const CONTRACT_METHODS = {
  CALCULATE: "calculate",
} as const

// 👉 PACKAGE ID của bạn (đã đúng)
export const PACKAGE_ID =
  "0x79b7453abe063fbc396bba3c125c9321fc2f3767af3884e4f2ca713c1c93c61d"

export type OperatorSymbol = "+" | "-" | "×" | "÷"

export interface CalculationInput {
  a: number
  b: number
  op: OperatorSymbol
}

export interface CalculationData {
  a: number
  b: number
  op: OperatorSymbol
  result: number
  owner: string
}

export interface ContractState {
  isLoading: boolean
  isPending: boolean
  isConfirming: boolean
  isConfirmed: boolean
  hash: string | undefined
  error: Error | null
}

export interface ContractActions {
  calculate: () => Promise<void>
  clearSession: () => void
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const opSymbolToCode: Record<OperatorSymbol, number> = {
  "+": 1,
  "-": 2,
  "×": 3,
  "÷": 4,
}

const codeToOpSymbol = (code: number): OperatorSymbol => {
  switch (code) {
    case 1:
      return "+"
    case 2:
      return "-"
    case 3:
      return "×"
    case 4:
      return "÷"
    default:
      return "+"
  }
}

function getCalculationFields(data: IotaObjectData): CalculationData | null {
  if (data.content?.dataType !== "moveObject") {
    console.log("Data is not a moveObject:", data.content?.dataType)
    return null
  }

  const fields = data.content.fields as any
  if (
    fields == null ||
    fields.a == null ||
    fields.b == null ||
    fields.op == null ||
    fields.result == null
  ) {
    console.log("Missing fields in Calculation object")
    return null
  }

  let owner = ""
  const rawOwner: any = (data as any).owner
  if (typeof rawOwner === "string") {
    owner = rawOwner
  } else if (rawOwner && typeof rawOwner === "object") {
    const v = Object.values(rawOwner)[0]
    owner = typeof v === "string" ? v : String(v ?? "")
  }

  if (!owner) {
    console.log("Owner not found on Calculation object")
    return null
  }

  return {
    a: Number(fields.a),
    b: Number(fields.b),
    op: codeToOpSymbol(Number(fields.op)),
    result: Number(fields.result),
    owner,
  }
}

// ---------------------------------------------------------------------------
// Main hook
// ---------------------------------------------------------------------------

export const useContract = () => {
  const currentAccount = useCurrentAccount()
  const iotaClient = useIotaClient()
  const { mutate: signAndExecute, isPending } = useSignAndExecuteTransaction()

  const [objectId, setObjectId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hash, setHash] = useState<string | undefined>()
  const [transactionError, setTransactionError] = useState<Error | null>(null)
  const [input, setInput] = useState<CalculationInput>({ a: 0, b: 0, op: "+" })

  // load objectId từ URL nếu có (#objectId)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash.slice(1)
      if (hash) setObjectId(hash)
    }
  }, [])

  const {
    data,
    error: queryError,
    refetch,
  } = useIotaClientQuery(
    "getObject",
    {
      id: objectId!,
      options: { showContent: true, showOwner: true },
    },
    { enabled: !!objectId }
  )

  const calcData: CalculationData | null = data?.data ? getCalculationFields(data.data) : null
  const objectExists = !!data?.data
  const hasValidData = !!calcData

  const calculate = async () => {
    if (!currentAccount) {
      setTransactionError(new Error("Please connect your wallet first."))
      return
    }

    try {
      setIsSubmitting(true)
      setTransactionError(null)
      setHash(undefined)

      const clampedA = Math.max(0, Math.floor(input.a))
      const clampedB = Math.max(0, Math.floor(input.b))
      const opCode = opSymbolToCode[input.op]

      const tx = new Transaction()
      tx.moveCall({
        target: `${PACKAGE_ID}::${CONTRACT_MODULE}::${CONTRACT_METHODS.CALCULATE}`,
        arguments: [tx.pure.u64(clampedA), tx.pure.u64(clampedB), tx.pure.u8(opCode)],
      })

      signAndExecute(
        { transaction: tx as any },
        {
          onSuccess: async ({ digest }) => {
            console.log("TX Digest:", digest)
            setHash(digest)

            try {
              const { effects } = await iotaClient.waitForTransaction({
                digest,
                options: { showEffects: true },
              })

              const created = effects?.created ?? []
              console.log("Created objects:", created)

              if (!created.length) {
                console.error("❌ No created objects in effects")
                setIsSubmitting(false)
                return
              }

              // 👉 lấy luôn object đầu tiên được tạo (transaction này chỉ tạo 1 Calculation)
              const newObjectId = created[0]?.reference?.objectId
              console.log("✔ New object ID:", newObjectId)

              if (!newObjectId) {
                console.error("❌ created[0] has no reference.objectId")
                setIsSubmitting(false)
                return
              }

              setObjectId(newObjectId)

              if (typeof window !== "undefined") {
                window.location.hash = newObjectId
              }

              await refetch()
            } catch (err) {
              console.error("❌ waitForTransaction error:", err)
            } finally {
              setIsSubmitting(false)
            }
          },

          onError: (err) => {
            const error = err instanceof Error ? err : new Error(String(err))
            console.error("❌ TX Error:", error)
            setTransactionError(error)
            setIsSubmitting(false)
          },
        }
      )
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      setTransactionError(error)
      console.error("Error building transaction:", err)
      setIsSubmitting(false)
    }
  }

  const clearSession = () => {
    setObjectId(null)
    setTransactionError(null)
    setHash(undefined)
    if (typeof window !== "undefined") {
      window.location.hash = ""
    }
  }

  const state: ContractState = {
    isLoading: isSubmitting,
    isPending,
    isConfirming: false,
    isConfirmed: !!hash && !isSubmitting && !isPending,
    hash,
    error: queryError || transactionError,
  }

  return {
    input,
    setInput,
    data: calcData,
    objectId,
    objectExists,
    hasValidData,
    state,
    actions: {
      calculate,
      clearSession,
    } as ContractActions,
  }
}

export default useContract
