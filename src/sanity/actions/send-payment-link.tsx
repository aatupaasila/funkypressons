import { CreditCardIcon } from "@sanity/icons/CreditCard";
import { useState } from "react";
import { useDocumentOperation, type DocumentActionComponent } from "sanity";

type RequestDoc = {
  quote?: number;
  name?: string;
  email?: string;
  status?: string;
  payment?: { linkUrl?: string; linkAmount?: number };
};

// The button only stamps paymentRequestedAt and publishes. A Sanity webhook then
// calls the website, which creates the Stripe link and emails it — so no secret
// ever lives in the Studio.
export const SendPaymentLinkAction: DocumentActionComponent = (props) => {
  const { patch, publish } = useDocumentOperation(props.id, props.type);
  const [confirming, setConfirming] = useState(false);
  const doc = (props.draft ?? props.published) as RequestDoc | null;

  const quote = doc?.quote;
  const alreadySent = Boolean(doc?.payment?.linkUrl);
  const disabledReason =
    doc?.status === "paid"
      ? "This request is already paid."
      : !quote || quote < 1
        ? "Add the quoted price first."
        : !doc?.email
          ? "The request has no email address."
          : null;

  return {
    label: alreadySent ? "Send new payment link" : "Send payment link",
    icon: CreditCardIcon,
    tone: "primary",
    disabled: Boolean(disabledReason) || Boolean(publish.disabled && props.draft),
    title: disabledReason ?? undefined,
    onHandle: () => setConfirming(true),
    dialog: confirming && {
      type: "confirm",
      tone: "primary",
      message: alreadySent
        ? `Email ${doc?.name ?? "the customer"} a new link for ${quote} €? The previous link (${doc?.payment?.linkAmount} €) stops working.`
        : `Email ${doc?.name ?? "the customer"} (${doc?.email}) a payment link for ${quote} €?`,
      onCancel: () => {
        setConfirming(false);
        props.onComplete();
      },
      onConfirm: () => {
        patch.execute([{ set: { paymentRequestedAt: new Date().toISOString() } }]);
        publish.execute();
        setConfirming(false);
        props.onComplete();
      },
    },
  };
};
