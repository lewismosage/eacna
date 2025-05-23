export default function MembershipRenewalPage() {
  // User details state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [membershipTier, setMembershipTier] = useState<MembershipTier>("Associate Member");
  const [originalTier, setOriginalTier] = useState<MembershipTier>("Associate Member");
  const [transactionId, setTransactionId] = useState("");

  // ... existing code ...

  // Update the filter logic in the upgrade select:
  {Object.keys(membershipTiers)
    .filter((tier) => {
      const currentTierIndex = Object.keys(membershipTiers).indexOf(originalTier);
      const thisTierIndex = Object.keys(membershipTiers).indexOf(tier);
      return thisTierIndex > currentTierIndex;
    })
    .map((tier) => (
      <option key={tier} value={tier}>
        {tier} - KES {membershipTiers[tier as MembershipTier].price.toLocaleString()}
      </option>
    ))}
} 