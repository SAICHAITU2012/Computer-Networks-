/* Computer Networks — Assignment Academy.
   Every MCQ from the assignment PDF with a verified answer key + per-statement
   explanations, and the four coding problems with given + optimal solutions
   and step-through visualisations. Data + practice logic live here. */
(function () {
  'use strict';
  const $ = (s, el) => (el || document).querySelector(s);
  const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));

  /* ================= ANSWER KEY (all multi-select) ================= */
  window.CN_ASSIGNMENTS = [
  {
    id: 1, title: 'Network Packets and Layered Communication', lecture: 2, color: '#2d6a8f',
    mcqs: [
    { id: 'c1q1', stmts: ["Layer 1 (Physical) is responsible for routing packets between different networks using IP addresses", "Layer 2 (Data Link) handles delivery within a single network segment using MAC addresses", "Layer 3 (Network) is responsible for routing packets across multiple networks using IP addresses", "Layer 4 (Transport) adds port numbers to identify which application should receive the data", "Layer 7 (Application) includes protocols like HTTP, DNS, and SMTP"], title: 'Q1. Match each responsibility to its correct OSI layer', correct: [1, 2, 3, 4], why: [
      '❌ Routing with IP addresses is Layer 3\'s job — Physical just moves bits (signals).',
      '✔ Frames + MAC addresses + "one segment" = textbook Layer 2.',
      '✔ IP addressing and inter-network routing is exactly Layer 3.',
      '✔ Ports live in the Transport header — they pick the application.',
      '✔ HTTP, DNS, SMTP are all Application-layer protocols.'] },
    { id: 'c1q2', stmts: ["Transport Layer", "Session Layer", "Application Layer", "Presentation Layer", "Network Layer"], title: 'Q2. In the TCP/IP model, which OSI layers collapse into the single "Application" layer?', correct: [1, 2, 3], why: [
      '❌ Transport (TCP/UDP) stays its own layer in TCP/IP.',
      '✔ Session folds into TCP/IP Application.',
      '✔ The OSI Application layer obviously maps to TCP/IP Application.',
      '✔ Presentation (encryption, formats) also folds in — TLS lives here.',
      '❌ Network becomes the "Internet" layer in TCP/IP, not Application.'] },
    { id: 'c1q3', stmts: ["Each layer can be changed independently without affecting other layers", "It guarantees that all network connections will be encrypted", "TCP works identically whether the underlying network is Ethernet, Wi-Fi, or 4G", "Problems can be isolated to a specific layer, making debugging faster", "A layered stack requires fewer total protocols than a single monolithic protocol"], title: 'Q3. Which are genuine benefits of a layered architecture?', correct: [0, 2, 3], why: [
      '✔ Modularity — swap one layer (e.g. Wi-Fi ↔ Ethernet) without touching the rest.',
      '❌ Nothing about layering guarantees encryption — TLS is a specific protocol choice.',
      '✔ The "opaque payload" principle: TCP runs unchanged over any link layer.',
      '✔ Isolation: "can ping but not browse" instantly points at DNS/L7, not cables.',
      '❌ Layering actually multiplies protocols (one per layer) — the trade-off is complexity.'] },
    { id: 'c1q4', stmts: ["Each layer adds its own header to the data passed down from the layer above", "The Application layer header contains MAC addresses", "The TCP segment\'s payload is the HTTP message from the Application layer", "The IP packet\'s payload is the complete TCP segment", "Each layer reads and modifies the headers added by all layers above it"], title: 'Q4. Which correctly describe what happens during encapsulation?', correct: [0, 2, 3], why: [
      '✔ Each layer wraps the layer above with its own header.',
      '❌ MAC addresses live in the Layer 2 frame header, not any application header.',
      '✔ Segment = TCP header + application data (the HTTP message).',
      '✔ Packet = IP header + the complete segment as payload.',
      '❌ Layers treat higher headers as opaque payload — they never read or modify them.'] },
    { id: 'c1q5', stmts: ["A frame uses MAC addresses and is valid only within a single network segment (one hop)", "A packet uses IP addresses and can travel across multiple networks", "A segment uses port numbers to identify which application should receive the data", "A packet is re-created at every router hop, just like a frame"], title: 'Q5. Which correctly distinguish frames, packets, and segments?', correct: [0, 1, 2], why: [
      '✔ Frame = MAC addresses, one hop, rebuilt at every router.',
      '✔ Packet = IP addresses, end-to-end across networks.',
      '✔ Segment = TCP header with ports identifying the application.',
      '❌ The PACKET survives the whole journey unchanged — only the FRAME is re-created per hop.'] },
    { id: 'c1q6', stmts: ["The Ethernet destination MAC is your home router\'s MAC, not Google\'s MAC", "The IP destination address is 142.250.195.46 (Google\'s server)", "The TCP destination port is 80 (HTTP)", "The Ethernet destination MAC is Google\'s server MAC", "The IP source address is 192.168.1.5 (your laptop)"], title: 'Q6. Laptop 192.168.1.5 → HTTP GET → google.com (142.250.195.46). True when the packet leaves the laptop?', correct: [0, 1, 2, 4], why: [
      '✔ The frame must reach the default gateway first — MAC dest = router.',
      '✔ IP destination is the final server, end-to-end.',
      '✔ HTTP → TCP destination port 80.',
      '❌ Google\'s MAC is unknown and meaningless here — MACs are link-local.',
      '✔ IP source is your laptop, unchanged until NAT.'] },
    { id: 'c1q7', stmts: ["The IP source address", "The Ethernet source MAC address", "The Ethernet destination MAC address", "The IP destination address", "The TCP sequence number"], title: 'Q7. A packet crosses three routers. What changes at EVERY hop?', correct: [1, 2], why: [
      '❌ IP source stays constant (absent NAT).',
      '✔ Every link gets a fresh frame with a new source MAC (the router\'s egress interface).',
      '✔ And a new destination MAC (the next hop).',
      '❌ IP destination never changes along the path.',
      '❌ TCP sequence numbers are end-to-end — routers never touch them.'] },
    { id: 'c1q8', stmts: ["The Preamble and SFD together occupy 8 bytes and are used to synchronize the receiver", "The EtherType field identifies the protocol carried in the payload", "The payload can be anywhere from 46 to 1500 bytes in size", "The Destination MAC field can be FF:FF:FF:FF:FF:FF to address all devices on the LAN"], title: 'Q8. Which correctly describe the Ethernet frame structure?', correct: [0, 1, 2, 3], why: [
      '✔ Preamble (7 B) + SFD (1 B) = 8 bytes of synchronisation.',
      '✔ EtherType 0x0800 = IPv4, 0x0806 = ARP, 0x86DD = IPv6.',
      '✔ Min 46 B (padded if shorter), max 1500 B (the MTU).',
      '✔ FF:FF:FF:FF:FF:FF is the L2 broadcast — every station on the LAN accepts it.'] },
    { id: 'c1q9', stmts: ["The IP layer fragments the data into multiple smaller packets", "The data is transmitted as a single 4,000-byte Ethernet frame", "All fragments of the same original packet have different IP Identification field values", "Fragments are reassembled at every intermediate router along the path"], title: 'Q9. 4,000 bytes over an MTU-1500 Ethernet — which are true?', correct: [0], why: [
      '✔ IP fragments: ceil(4000/1480) = 3 fragments (1480 B of payload each, minus headers).',
      '❌ Impossible — the frame caps at 1500 B.',
      '❌ All fragments share the SAME IP Identification value so the receiver can reassemble.',
      '❌ Reassembly happens ONLY at the final destination — routers just forward.'] },
    { id: 'c1q10', stmts: ["A MAC address is 48 bits (6 bytes) long", "MAC addresses are globally routable — a router uses them to forward packets across the internet", "A MAC address is replaced with a new one at every router hop", "A MAC address remains the same throughout the entire journey from source to destination device", "Modern smartphones randomize their MAC address when connecting to new networks for privacy"], title: 'Q10. Which correctly describe MAC addresses?', correct: [0, 2, 4], why: [
      '✔ 48 bits = 6 bytes: 3-byte OUI + 3-byte device ID.',
      '❌ MACs are link-local; internet routers forward on IP addresses.',
      '✔ Both MACs are rewritten at every router hop.',
      '❌ That\'s the IP\'s job — MACs change per hop.',
      '✔ Wi-Fi MAC randomisation is a real privacy feature on modern phones.'] },
    { id: 'c1q11', stmts: ["Layer 1 (Physical) — because the Wi-Fi connection shows as active", "Layer 2 (Data Link) — because the user can reach the home router", "Layer 3 (Network) — because the user cannot ping an external IP address", "Layer 4 (Transport) — because TCP connections are failing", "Layer 7 (Application) — because websites won\'t load"], title: 'Q11. "Wi-Fi connected, router reachable, can\'t ping 8.8.8.8, no websites." Which OSI layers are at fault?', correct: [2], why: [
      '❌ L1 is fine — the link is up.',
      '❌ L2 is fine — reaching the router proves local delivery works.',
      '✔ Cannot ping an external IP = no path beyond the gateway → Layer 3 (no valid IP/route/gateway).',
      '❌ L4 isn\'t the cause — TCP only fails because packets can\'t leave the network.',
      '❌ L7 is the symptom (websites), not the fault.'] },
    { id: 'c1q12', stmts: ["The physical material used to manufacture network cables", "The format of messages — what fields appear and in what order", "The sequence of operations — who communicates first and how responses are structured", "The actions to take when a message is lost or corrupted", "The brand of hardware that must be used at each end"], title: 'Q12. Which are part of what a network protocol defines?', correct: [1, 2, 3], why: [
      '❌ Cable materials are physical/engineering specs, not the protocol.',
      '✔ Syntax: message format and field order.',
      '✔ Semantics & sequencing: who talks first, how replies work.',
      '✔ Error handling: what to do on loss or corruption.',
      '❌ Hardware brand is irrelevant — protocols are vendor-neutral.'] },
    ],
  },
  {
    id: 2, title: 'IP Addresses and Subnetting I', lecture: 3, color: '#2f6b58',
    mcqs: [
    { id: 'c2q1', stmts: ["An IPv4 address is a 64-bit number", "IPv4 uses dotted-decimal notation, with four 8-bit sections called octets", "Each octet in an IPv4 address can range from 0 to 511", "The total number of possible IPv4 addresses is approximately 4.3 billion (2^32)", "An IPv4 address is a 32-bit number"], title: 'Q1. Which correctly describe IPv4 addresses?', correct: [1, 3, 4], why: [
      '❌ IPv4 is 32-bit; 64-bit is IPv6\'s neighbour... (actually IPv6 is 128-bit).',
      '✔ Four octets, each 8 bits, written 192.168.1.5.',
      '❌ An octet is 8 bits → range 0–255, not 511.',
      '✔ 2³² ≈ 4,294,967,296 ≈ 4.3 billion.',
      '✔ Exactly — 32 bits.'] },
    { id: 'c2q2', stmts: ["IP addresses are globally meaningful — every public IP on the internet is unique", "IP addresses are hierarchical, embedding location information that helps with routing", "IP addresses are assigned logically and can be changed, unlike MAC addresses burned into hardware", "IP addresses work only inside a single subnet, just like MAC addresses", "IP addresses eliminate the need for MAC addresses entirely"], title: 'Q2. Why are IP addresses necessary?', correct: [0, 1, 2], why: [
      '✔ Global uniqueness is what makes end-to-end delivery possible.',
      '✔ Hierarchy (network + host) lets routers aggregate routes.',
      '✔ Logical & reassignable — your laptop keeps its name (MAC) but gets new IPs.',
      '❌ The whole point is crossing subnets — that\'s MACs that are link-local.',
      '❌ They complement MACs — delivery on the local link still needs L2 addresses.'] },
    { id: 'c2q3', stmts: ["192 in binary = 11000000", "168 in binary = 10101000", "255 in binary = 111111111", "10 in binary = 00001010", "11000000 in decimal = 128"], title: 'Q3. Which binary ⇄ decimal conversions are correct?', correct: [0, 1, 3], why: [
      '✔ 128+64 = 192.',
      '✔ 128+32+8 = 168.',
      '❌ That\'s NINE ones = 511. 255 = 11111111 (eight ones).',
      '✔ 8 = 00001010.',
      '❌ 11000000 = 128+64 = 192, not 128.'] },
    { id: 'c2q4', stmts: ["It is a 32-bit number where all the 1s come first, followed by all 0s", "The 1-bits in the mask mark the network portion of an IP address", "The 1-bits in the mask mark the host portion of an IP address", "To find the network address, you perform a bitwise AND between the IP and the subnet mask", "A subnet mask determines which domain name corresponds to an IP address"], title: 'Q4. What does a subnet mask do?', correct: [0, 1, 3], why: [
      '✔ Contiguous 1s then 0s — e.g. /24 = 255.255.255.0.',
      '✔ 1-bits = "this part is the network".',
      '❌ The 0-BITS mark the host portion.',
      '✔ IP AND mask = network address — the AND trick.',
      '❌ Name↔IP mapping is DNS\'s job.'] },
    { id: 'c2q5', stmts: ["The network address is 172.16.0.0", "The AND operation zeroes out the host bits while preserving the network bits", "The network address is 172.16.5.0", "The host portion of 172.16.5.10 with this mask is 16.5.10 (the last three octets)", "The host portion of 172.16.5.10 with this mask is 5.10 (the last two octets)"], title: 'Q5. IP 172.16.5.10 with mask 255.255.0.0 — correct outcomes?', correct: [0, 1, 4], why: [
      '✔ 172.16 AND 255.255 → network 172.16.0.0.',
      '✔ That\'s precisely what AND does.',
      '❌ The 5.10 part is host bits — masked out.',
      '❌ Host portion = last TWO octets here (mask is /16).',
      '✔ Host bits are everything the mask zeroed: 5.10.'] },
    { id: 'c2q6', stmts: ["The network address is 192.168.10.0", "The broadcast address is 192.168.10.255", "The number of usable host addresses is 254", "The address 192.168.10.0 can be assigned to a device as its IP", "The address 192.168.10.255 can be assigned to a printer on this subnet"], title: 'Q6. For the subnet 192.168.10.0/24, which are correct?', correct: [0, 1, 2], why: [
      '✔ Host bits all zero = the network identity.',
      '✔ Host bits all ones = broadcast.',
      '✔ 2⁸ − 2 = 254.',
      '❌ .0 is the network address — never assignable.',
      '❌ .255 is broadcast — never assignable.'] },
    { id: 'c2q7', stmts: ["/24 → 254 usable hosts", "/30 → 4 usable hosts", "/28 → 14 usable hosts", "/16 → 65,534 usable hosts", "/32 → 254 usable hosts"], title: 'Q7. Which CIDR prefix ↔ host-count pairs are correct?', correct: [0, 2, 3], why: [
      '✔ 2⁸ − 2 = 254.',
      '❌ /30 gives 2 total − 2 = 2 usable (the 4 is TOTAL addresses).',
      '✔ 2⁴ − 2 = 14.',
      '✔ 2¹⁶ − 2 = 65,534.',
      '❌ /32 is a single host route — 0 usable "extra" hosts.'] },
    { id: 'c2q8', stmts: ["Class A addresses have first octets ranging from 1 to 126, with 8 network bits", "Class B addresses have first octets ranging from 128 to 191, with 16 network bits", "Class C addresses have first octets ranging from 192 to 223, with 24 network bits", "Class C subnets support up to 65,534 usable host addresses", "Class A subnets have more host bits than Class C, so they support fewer devices"], title: 'Q8. Which correctly describe classful addressing?', correct: [0, 1, 2], why: [
      '✔ /8 networks, 16.7M hosts each (127 is loopback).',
      '✔ /16 networks, 65,534 hosts each.',
      '✔ /24 networks, 254 hosts each.',
      '❌ Class C = 254 usable, not 65,534.',
      '❌ More host bits = MORE devices — Class A is the giant.'] },
    { id: 'c2q9', stmts: ["10.200.50.6", "172.20.5.1", "192.168.100.254", "45.123.67.89", "172.32.0.1"], title: 'Q9. Which addresses belong to IANA private ranges?', correct: [0, 1, 2], why: [
      '✔ 10.0.0.0/8.',
      '✔ 172.16.0.0/12 covers 172.16–172.31.',
      '✔ 192.168.0.0/16.',
      '❌ 45.x is public.',
      '❌ 172.32 is OUTSIDE 172.16–31 → public. Classic trap!'] },
    { id: 'c2q10', stmts: ["There are not enough public IPv4 addresses for every device on earth", "Private addresses allow thousands of different networks to reuse the same internal address ranges without conflict", "Private addresses are more secure because they are not routable on the public internet", "Private addresses eliminate the need for a router in a home network", "Only the router needs a public IP; all internal devices can share private addresses via NAT"], title: 'Q10. Why do private address ranges exist?', correct: [0, 1, 2, 4], why: [
      '✔ 4.3B addresses < devices on Earth — exhaustion is real.',
      '✔ Reuse: every home can use 192.168.x.x privately.',
      '✔ Not internet-routable → an accidental security layer.',
      '❌ You still need a router/NAT to reach the internet.',
      '✔ One public IP + NAT = the whole home-network model.'] },
    { id: 'c2q11', stmts: ["127.0.0.1 is the loopback address — packets sent there never leave the device", "A device with IP 169.254.45.12 has likely failed to obtain an address from DHCP", "255.255.255.255 is the limited broadcast address sent to all hosts on the local subnet", "0.0.0.0 can be allocated to a specific device on the local network"], title: 'Q11. Which correctly describe special IPv4 addresses?', correct: [0, 1, 2], why: [
      '✔ Loopback — testing your own TCP/IP stack.',
      '✔ 169.254.x.x is APIPA — DHCP failed, self-assigned link-local.',
      '✔ Limited broadcast — never forwarded by routers.',
      '❌ 0.0.0.0 means "unspecified/this host" — never assigned to a device.'] },
    { id: 'c2q12', stmts: ["The subnet mask in dotted-decimal is 255.255.255.64", "The subnet mask in dotted-decimal is 255.255.255.128", "The number of usable host addresses is 126", "The number of usable host addresses is 256", "The network address is 192.168.1.128"], title: 'Q12. Subnet 192.168.1.128/25 — which are correct?', correct: [1, 2, 4], why: [
      '❌ 64 isn\'t a valid mask octet (masks are contiguous 1s).',
      '✔ /25 = 255.255.255.128.',
      '✔ 2⁷ − 2 = 126.',
      '❌ 256 would be 2⁸ — but 2 host bits are reserved.',
      '✔ The given address IS the network address (block 128–255).'] },
    { id: 'c2q13', stmts: ["A /30 subnet has exactly 2 usable host addresses — one for each end of the link", "Using a /30 wastes fewer IP addresses than assigning a /24 to a link with only 2 devices", "A /30 subnet has 4 usable host addresses", "A /30 subnet can support up to 30 devices on a single link", "The formula 2^(32-30) - 2 = 2 gives the correct number of usable hosts for a /30"], title: 'Q13. Why are /30 subnets used for router-to-router links?', correct: [0, 1, 4], why: [
      '✔ 2 usable = one per end. Perfect fit.',
      '✔ A /24 on a 2-device link wastes 252 addresses.',
      '❌ /30 has 4 TOTAL addresses, 2 usable.',
      '❌ 30 would be the total-ish number, not usable — and /30 gives 2.',
      '✔ The formula is exactly how the count is derived.'] },
    ],
  },
  {
    id: 3, title: 'IP Addresses and Subnetting II', lecture: 4, color: '#356f6a',
    mcqs: [
    { id: 'c3q1', stmts: ["The minimum host bits required is 6", "The prefix length of the resulting subnet is /24", "The block size (total addresses per subnet) is 64", "The number of usable host addresses is 64", "A /25 subnet would also work but wastes fewer addresses than /26"], title: 'Q1. 50 hosts per subnet — which are correct?', correct: [0, 2], why: [
      '✔ 2⁵−2 = 30 < 50, 2⁶−2 = 62 ≥ 50 → 6 host bits.',
      '❌ /26 (32−6 = 26), not /24.',
      '✔ Block = 2⁶ = 64 total addresses.',
      '❌ Usable = 62 (minus network + broadcast).',
      '❌ /25 would waste MORE addresses (126 vs 62), not fewer.'] },
    { id: 'c3q2', stmts: ["Each /28 subnet contains 16 total addresses", "The number of usable hosts per /28 subnet is 14", "The total number of /28 subnets that fit in a /24 is 16", "The total number of /28 subnets that fit in a /24 is 8", "The first /28 subnet spans 192.168.10.0 to 192.168.10.31"], title: 'Q2. Dividing 192.168.10.0/24 into /28 subnets — which are correct?', correct: [0, 1, 2], why: [
      '✔ 2⁴ = 16 total addresses.',
      '✔ 16 − 2 = 14 usable.',
      '✔ 2^(28−24) = 16 subnets.',
      '❌ It\'s 16, not 8.',
      '❌ First /28 spans .0–.15 (16 addresses).'] },
    { id: 'c3q3', stmts: ["VLSM allows subnets of different sizes to be allocated from the same address block", "When using VLSM, the largest subnet requirement should be allocated first", "In VLSM, all subnets within a network must use the same prefix length", "Allocating the smallest subnet first prevents IP address overlap"], title: 'Q3. Which correctly describe VLSM?', correct: [0, 1], why: [
      '✔ Variable lengths — right-size every subnet.',
      '✔ Allocate largest first so smaller ones fit in the gaps.',
      '❌ Same prefix everywhere = FLSM, the opposite of VLSM.',
      '❌ Smallest first fragments the space — overlaps become likely.'] },
    { id: 'c3q4', stmts: ["Engineering gets 192.168.10.0/26 (addresses .0–.63)", "Marketing gets 192.168.10.64/27 (addresses .64–.95)", "HR gets 192.168.10.96/28 (addresses .96–.111)", "Management gets 192.168.10.64/29", "The /26 for Engineering provides exactly 60 usable hosts — no waste"], title: 'Q4. VLSM for 192.168.10.0/24 — Eng 60, Mkt 30, HR 10, Mgmt 5. Golden rule?', correct: [0, 1, 2], why: [
      '✔ 60 hosts → 6 host bits → /26 → .0–.63.',
      '✔ 30 hosts → 5 bits → /27 → .64–.95.',
      '✔ 10 hosts → 4 bits → /28 → .96–.111 (14 usable).',
      '❌ .64/29 overlaps Marketing\'s .64/27 — overlap is the golden-rule sin.',
      '❌ /26 gives 62 usable — 2 spare, not "exactly 60".'] },
    { id: 'c3q5', stmts: ["An IPv6 address is 128 bits long", "IPv6 uses 8 groups of 4 hexadecimal digits separated by colons", "The total number of IPv6 addresses is approximately 3.4 × 10³⁸", "IPv6 addresses use dotted-decimal notation, just like IPv4", "Leading zeros within a group can be omitted when writing an IPv6 address"], title: 'Q5. Which correctly describe the IPv6 address format?', correct: [0, 1, 2, 4], why: [
      '✔ 128 bits — 4× IPv4.',
      '✔ 8 groups × 4 hex digits, colon-separated.',
      '✔ 2¹²⁸ ≈ 3.4 × 10³⁸.',
      '❌ Hexadecimal + colons, not dotted-decimal.',
      '✔ 0db8 → db8 is legal (within a group).'] },
    { id: 'c3q6', stmts: ["2001:0db8:85a3:0000:0000:8a2e:0370:7334 → 2001:db8:85a3::8a2e:370:7334", "The :: notation can be used to replace multiple consecutive all-zero groups", ":: can appear twice in the same IPv6 address for separate zero runs", "The loopback address 0000:0000:0000:0000:0000:0000:0000:0001 shortens to ::1", "fe80:0000:0000:0001 shortens to fe80::1 using both shortening rules"], title: 'Q6. Which IPv6 shortening operations are valid?', correct: [0, 1, 3], why: [
      '✔ Leading zeros dropped + one :: for the two zero groups.',
      '✔ The one-:: rule, replacing ≥1 consecutive all-zero groups.',
      '❌ :: may appear only ONCE per address (ambiguity).',
      '✔ 0000…0001 → ::1 — the classic.',
      '❌ fe80::1 expands to EIGHT groups; fe80:0:0:1 has only four — the :: doesn\'t match.'] },
    { id: 'c3q7', stmts: ["Global Unicast addresses use the prefix 2000::/3 — these are publicly routable", "Link-Local addresses use the prefix fe80::/10 — valid both on local and global segments", "The loopback address in IPv6 is ::1/128, equivalent to IPv4's 127.0.0.1", "Multicast addresses use the prefix ff00::/8", "The unspecified address in IPv6 is 255.255.255.255"], title: 'Q7. Which IPv6 type ↔ prefix pairs are correct?', correct: [0, 2, 3], why: [
      '✔ 2000::/3 — the public internet.',
      '❌ Link-local works ONLY on the local link — never routed globally.',
      '✔ ::1 = IPv6 loopback.',
      '✔ ff00::/8 = multicast.',
      '❌ Unspecified is :: — 255.255.255.255 is IPv4 broadcast (which IPv6 dropped).'] },
    { id: 'c3q8', stmts: ["In IPv6, fragmentation is performed only by the source host, not by intermediate routers", "IPv6 does not use broadcast; it uses multicast instead", "IPv6 requires NAT to conserve the limited address space", "IPv6 replaces ARP with NDP (Neighbor Discovery Protocol)", "IPv6 has a fixed 40-byte header, while IPv4 has a variable-length header"], title: 'Q8. IPv4 vs IPv6 differences — which are correct?', correct: [0, 1, 3, 4], why: [
      '✔ Routers never fragment in IPv6 — source does PMTUD.',
      '✔ Broadcast removed; multicast (and anycast) instead.',
      '❌ 2¹²⁸ addresses — NAT is pointless in IPv6.',
      '✔ NDP does what ARP did (plus more) via ICMPv6.',
      '✔ Fixed 40-byte IPv6 header vs IPv4\'s variable 20–60 B.'] },
    { id: 'c3q9', stmts: ["The device performs a bitwise AND of the destination IP with its subnet mask to check if the destination is local", "If the destination IP AND mask equals the device\'s own network address, the packet is sent directly using ARP", "If the destination is outside the local subnet, the packet is sent to the default gateway", "The default gateway is always the broadcast address of the subnet", "A packet to 192.168.1.20 from 192.168.1.5/24 would be sent directly without involving the gateway"], title: 'Q9. Device 192.168.1.5/24 — how does it decide where to send a packet?', correct: [0, 1, 2, 4], why: [
      '✔ dest AND mask vs own network — the local-or-not test.',
      '✔ Equal → same subnet → ARP for the destination, deliver directly.',
      '✔ Different → hand to the default gateway.',
      '❌ Gateway is a normal host address (e.g. .1), never the broadcast.',
      '✔ .20 is inside /24 → direct, no gateway.'] },
    { id: 'c3q10', stmts: ["The limited broadcast address is 255.255.255.255 and is never forwarded by routers", "A directed broadcast targets all hosts within a specific subnet (e.g., 192.168.2.255 for the 192.168.2.0/24 subnet)", "The limited broadcast 255.255.255.255 is used by protocols like DHCP and ARP to reach all devices on the local segment", "Most routers forward directed broadcasts by default to improve network reachability", "The broadcast address of a subnet is the address with all host bits set to 1"], title: 'Q10. Which correctly describe broadcast address types?', correct: [0, 1, 4], why: [
      '✔ 255.255.255.255 never leaves the local segment.',
      '✔ Directed broadcast = a specific subnet\'s all-ones address.',
      '❌ DHCP yes — but ARP broadcasts at LAYER 2 (FF:FF:FF:FF:FF:FF) and has no IP destination at all.',
      '❌ Routers do NOT forward directed broadcasts by default (disabled since RFC 2644 — smurf-attack defence).',
      '✔ All host bits = 1 is the definition.'] },
    { id: 'c3q11', stmts: ["The router maintains a translation table mapping (private IP, private port) to (public IP, public port)", "When a packet leaves the home network, the router replaces the private source IP with its public IP", "When a response arrives, the router looks up the translation table using the destination port to find the correct private host", "NAT allows all devices on a private network to share a single public IP address simultaneously", "The router replaces the destination IP on outbound packets to direct traffic to the correct private host"], title: 'Q11. Which correctly describe the NAT translation mechanism?', correct: [0, 1, 2, 3], why: [
      '✔ (priv IP:port ↔ pub IP:port) — the router\'s magic table.',
      '✔ Outbound: source rewritten to the public IP.',
      '✔ Inbound: dest port identifies which private host.',
      '✔ One public IP, many devices — ports are the discriminator.',
      '❌ Destination rewriting happens on INBOUND (DNAT), not outbound.'] },
    { id: 'c3q12', stmts: ["SNAT (Source NAT) modifies the source address of outgoing packets", "DNAT (Destination NAT) modifies the destination address, commonly used for port forwarding", "PAT (Port Address Translation) allows multiple private hosts to share one public IP by using different port numbers", "DNAT is used when an internal host initiates a connection to an external server", "PAT is also known as \"Masquerade\" in Linux iptables"], title: 'Q12. Which correctly describe NAT variants?', correct: [0, 1, 2, 4], why: [
      '✔ SNAT = rewrite source (outbound).',
      '✔ DNAT = rewrite destination (port forwarding).',
      '✔ PAT = many hosts, one IP, ports tell them apart.',
      '❌ Outbound internal-initiated = SNAT\'s job.',
      '✔ iptables MASQUERADE = PAT with the interface\'s IP.'] },
    { id: 'c3q13', stmts: ["This requires DNAT (port forwarding) on the router", "The router must be configured to forward incoming packets on public port 27015 to 192.168.1.10:27015", "A friend connects to 203.0.113.5:27015 and the router translates this to 192.168.1.10:27015", "SNAT alone is sufficient to allow friends to reach the game server", "Without port forwarding, the router has no translation table entry for unsolicited inbound traffic and drops it"], title: 'Q13. Game server 192.168.1.10:27015, public IP 203.0.113.5 — which are correct?', correct: [0, 1, 2, 4], why: [
      '✔ Inbound needs destination rewriting = DNAT.',
      '✔ Static rule: public :27015 → private .10:27015.',
      '✔ Friends dial the public IP; router translates inward.',
      '❌ SNAT only fixes outbound — unsolicited inbound still dies.',
      '✔ No table entry → no idea where to send it → drop (the accidental firewall).'] },
    { id: 'c3q14', stmts: ["NAT breaks the internet\'s end-to-end connectivity model — devices behind NAT cannot be directly reached from outside", "NAT is stateful — if the router reboots, the translation table is lost and existing connections break", "Some protocols like FTP and SIP embed IP addresses in their payload, requiring Application Layer Gateways (ALGs) to work through NAT", "NAT permanently solves the IPv4 address exhaustion problem, making IPv6 unnecessary", "NAT introduces complexity in network troubleshooting because the original source IP is hidden from the destination"], title: 'Q14. Which correctly describe NAT limitations?', correct: [0, 1, 2, 4], why: [
      '✔ End-to-end broken — inbound needs explicit forwarding/holes.',
      '✔ Stateful — reboot wipes the table, connections die.',
      '✔ FTP/SIP embed IPs in payload → need ALGs to rewrite.',
      '❌ NAT is a band-aid; IPv6 is the actual cure.',
      '✔ Logs show the router\'s IP, not the real sender — forensic pain.'] },
    ],
  },
  {
    id: 4, title: 'Graph Algorithms for Networking', lecture: 5, color: '#9c2c4c',
    mcqs: [
    { id: 'c4q1', stmts: ["Routers and network nodes correspond to vertices in the graph", "Network links between routers correspond to edges in the graph", "Edge weights can represent link cost metrics such as latency or bandwidth", "A physical Ethernet cable is always modeled as a directed edge (one-way only)", "An adjacency list is preferred over an adjacency matrix for sparse networks like the internet"], title: 'Q1. How is a computer network modeled as a graph?', correct: [0, 1, 2, 4], why: [
      '✔ Routers/switches = vertices.',
      '✔ Links = edges.',
      '✔ Weights = latency, cost, bandwidth-derived metrics.',
      '❌ A cable works both ways — undirected.',
      '✔ Sparse graph (few edges per node) → lists save memory (O(V+E) vs O(V²)).'] },
    { id: 'c4q2', stmts: ["BFS explores nodes layer by layer — all nodes 1 hop away, then 2 hops, then 3 hops", "BFS uses a queue (FIFO) to track which node to explore next", "BFS finds the minimum-cost path in a weighted graph", "BFS finds the minimum-hop path (fewest edges) in an unweighted graph", "BFS visits every reachable node from the starting node"], title: 'Q2. Which correctly describe BFS?', correct: [0, 1, 3, 4], why: [
      '✔ Ring ripple: 1 hop, 2 hops, 3 hops…',
      '✔ FIFO queue guarantees the ring order.',
      '❌ Weights ignored — that\'s Dijkstra\'s job.',
      '✔ Fewest EDGES = BFS\'s guarantee.',
      '✔ Everything reachable gets visited.'] },
    { id: 'c4q3', stmts: ["DFS goes as deep as possible down one path before backtracking", "DFS uses a stack (or recursion) internally", "DFS always finds the shortest path between two nodes", "DFS can be used to detect cycles in a graph", "DFS and BFS visit all reachable nodes, but in a different order"], title: 'Q3. Which correctly describe DFS?', correct: [0, 1, 3, 4], why: [
      '✔ Dive deep, backtrack only when stuck.',
      '✔ Explicit stack or the call stack.',
      '❌ DFS finds *a* path, rarely the shortest.',
      '✔ Back-edge detection = cycle finding.',
      '✔ Same coverage, different order.'] },
    { id: 'c4q4', stmts: ["BFS is conceptually related to RIP, which uses hop count as its routing metric", "DFS is useful for cycle detection — identifying routing loops where packets circulate forever", "BFS\'s layer-by-layer exploration maps to how RIP propagates route information outward hop by hop", "DFS guarantees minimum-cost packet delivery and is used directly in OSPF", "DFS is used in Spanning Tree construction for network topology exploration"], title: 'Q4. How are BFS and DFS used in networking?', correct: [0, 1, 2, 4], why: [
      '✔ RIP = hop count = BFS-flavoured metric.',
      '✔ Cycle detection finds the loops packets would circle forever.',
      '✔ RIP\'s gossip spreads outward one hop per exchange — BFS-shaped.',
      '❌ OSPF runs DIJKSTRA, not DFS — and DFS guarantees no costs.',
      '✔ A spanning tree is what DFS builds; STP builds one too (its own way).'] },
    { id: 'c4q5', stmts: ["BFS picks the minimum-hop path, which is not always the minimum-cost path in a weighted graph", "If a 1-hop link has cost 100 and a 3-hop path costs 3, BFS picks the 3-hop path", "BFS picks the 1-hop path (cost 100) even if the 3-hop path (cost 3) is cheaper", "BFS always produces correct results if all edge weights are equal", "Dijkstra is needed when edge weights differ to find the true minimum-cost path"], title: 'Q5. When does BFS give a wrong answer for shortest paths?', correct: [0, 2, 3, 4], why: [
      '✔ BFS minimises hops, not cost.',
      '❌ BFS takes the 1-hop path — that\'s the failure!',
      '✔ Exactly the failure mode: cheap-but-long loses to expensive-but-short.',
      '✔ Equal weights ⇒ hops ≡ cost ⇒ BFS correct.',
      '✔ Differing weights need Dijkstra\'s priority queue.'] },
    { id: 'c4q6', stmts: ["Dijkstra maintains a distance array initialized to infinity for all nodes except the source", "At each step, Dijkstra expands the unvisited node with the smallest current distance", "Dijkstra uses a priority queue to efficiently find the minimum-cost unvisited node", "Dijkstra works correctly with negative edge weights", "Once a node is finalized (marked visited), its shortest distance cannot be improved"], title: 'Q6. Which correctly describe Dijkstra\'s algorithm?', correct: [0, 1, 2, 4], why: [
      '✔ dist[] = ∞ everywhere, 0 at the source.',
      '✔ Greedy: always grow the closest frontier node.',
      '✔ Priority queue (min-heap) finds it efficiently.',
      '❌ Negative weights break the greedy finalisation — that\'s Bellman-Ford.',
      '✔ The greedy invariant: finalised = final.'] },
    { id: 'c4q7', stmts: ["OSPF (Open Shortest Path First) uses Dijkstra\'s algorithm to compute best paths", "Each OSPF router runs Dijkstra on a complete map of the network (the LSDB)", "RIP uses Dijkstra to compute minimum-cost paths between routers", "Dijkstra is the theoretical basis for link-state routing protocols", "Dijkstra only works on networks with fewer than 100 routers"], title: 'Q7. How does Dijkstra connect to real networking?', correct: [0, 1, 3], why: [
      '✔ OSPF = Open Shortest Path First — the name says it.',
      '✔ Every OSPF router has the full LSDB and runs SPF itself.',
      '❌ RIP uses Bellman-Ford (distance vector).',
      '✔ Link-state = "everyone knows the map, everyone runs Dijkstra".',
      '❌ No such cap — OSPF scales to huge networks with areas.'] },
    { id: 'c4q8', stmts: ["Hyderabad is the first node finalized (cost 3 from Mumbai)", "The shortest path cost from Mumbai to Bangalore is 5 (via Hyderabad)", "Delhi is finalized with cost 5", "Chennai\'s final shortest distance from Mumbai is 9", "The shortest path to Bangalore is Mumbai → Delhi → Hyderabad → Bangalore (cost 9)"], title: 'Q8. Dijkstra trace — Mumbai network (Mum–Hyd 3, Mum–Del 5, Del–Hyd 2, Hyd–Bng 2, Del–Che 8, Che–Bng 4), from Mumbai:', correct: [0, 1, 2, 3], why: [
      '✔ Frontier after Mumbai: Hyd=3 < Del=5 → Hyderabad finalised first.',
      '✔ Mumbai→Hyd→Bng = 3+2 = 5 — the true shortest.',
      '✔ Delhi stays at 5 (via Hyd also 3+2=5, same).',
      '✔ Best to Chennai: Mum→Hyd→Bng→Che = 3+2+4 = 9 (Del–Che 8 gives 13).',
      '❌ That path costs 5+2+2 = 9 and isn\'t shortest — 5 via Hyd wins.'] },
    { id: 'c4q9', stmts: ["With a simple array for the priority queue, time complexity is O(V²)", "With a binary heap (heapq), time complexity is O((V+E) log V)", "Dijkstra with a binary heap is always faster than with a simple array", "In Python, the heapq module provides a min-heap used in Dijkstra\'s priority queue", "Dijkstra\'s complexity is O(E log V) when the graph is sparse (E << V²)"], title: 'Q9. Which correctly describe Dijkstra\'s time complexity?', correct: [0, 1, 3, 4], why: [
      '✔ Array scan for min = O(V) per extraction → O(V²) total.',
      '✔ Heap operations cost log V each.',
      '❌ "Always" is false — dense graphs (E≈V²) favour the array version.',
      '✔ heapq = min-heap — exactly what Dijkstra needs.',
      '✔ Sparse: E ≈ V → O(V log V + E log V) ≈ O(E log V).'] },
    { id: 'c4q10', stmts: ["An adjacency list stores each node\'s neighbors as a list of (neighbor, weight) pairs", "An adjacency matrix stores all pair-wise connections in a V×V array", "For the internet (millions of routers, each with few connections), the adjacency list uses less memory", "An adjacency matrix allows O(1) lookup of whether two nodes are connected", "For a complete graph where every router connects to every other router, both representations use similar memory"], title: 'Q10. Which correctly describe the two graph representations?', correct: [0, 1, 2, 3, 4], why: [
      '✔ List: per node, its (neighbour, weight) pairs.',
      '✔ Matrix: V×V grid, cell = edge/weight.',
      '✔ Internet is sparse → V+E ≪ V².',
      '✔ Matrix direct indexing = O(1) "are these connected?".',
      '✔ Complete graph: list holds ~V² entries too — parity.'] },
    { id: 'c4q11', stmts: ["deque from Python\'s collections module is used instead of a list because popleft() is O(1)", "A visited set is used to track already-explored nodes and prevent infinite loops", "Using list.pop(0) instead of deque.popleft() would produce incorrect results", "The BFS path-tracking version stores tuples of (current_node, path_so_far) in the queue", "BFS terminates when it finds the destination node or exhausts all reachable nodes"], title: 'Q11. Which correctly describe the lecture\'s Python BFS implementation?', correct: [0, 1, 3, 4], why: [
      '✔ list.pop(0) is O(n) — deque.popleft() is O(1).',
      '✔ Without visited, cycles loop forever.',
      '❌ pop(0) gives the SAME order — just slower (O(n) each).',
      '✔ Carrying the path alongside the node = the path-tracking trick.',
      '✔ Stop at destination, or when the queue empties.'] },
    { id: 'c4q12', stmts: ["The shortest distance from Mumbai to Pune is 2", "The shortest distance from Mumbai to Hyderabad remains 3 (via Hyderabad directly)", "The path Mumbai → Pune → Hyderabad has cost 2 + 4 = 6, which is worse than the direct 3", "Adding Pune changes the shortest path from Mumbai to Bangalore", "Dijkstra must be re-run from scratch when a new node is added"], title: 'Q12. Pune added (Mumbai 2, Hyderabad 4). After Dijkstra from Mumbai:', correct: [0, 1, 2, 4], why: [
      '✔ Direct edge, cost 2.',
      '✔ Still 3 — going via Pune costs 6.',
      '✔ 2+4 = 6 > 3 — Pune\'s back-edge is useless.',
      '❌ Bangalore unchanged: still 5 via Hyderabad.',
      '✔ New node ⇒ new distances ⇒ recompute (in the lecture\'s model).'] },
    { id: 'c4q13', stmts: ["DFS detects a cycle when it finds a \"back edge\" — an edge pointing to a node already in the current recursion stack", "The recursion stack tracks nodes on the current DFS path from the source", "A node in visited but NOT in rec_stack means it was explored on a different path — not a cycle", "If DFS finds a neighbor in visited, it always means a cycle exists", "Routing protocols use cycle detection to identify routing loops"], title: 'Q13. Which correctly describe DFS cycle detection in directed graphs?', correct: [0, 1, 2, 4], why: [
      '✔ Back edge to a node ON the current stack = cycle.',
      '✔ rec_stack = "am I on the path being explored right now?".',
      '✔ Visited-but-not-on-stack = a finished side branch — safe.',
      '❌ Visited alone isn\'t enough — cross edges would false-positive.',
      '✔ Loop detection is cycle detection in routing land.'] },
    { id: 'c4q14', stmts: ["The internet\'s OSPF protocol is based on Dijkstra because every router builds a complete topology map", "RIP uses hop count as its metric, which corresponds to the edge count in an unweighted graph — similar to BFS", "In OSPF, if a link fails, only the two directly connected routers need to re-run Dijkstra", "The priority queue in Dijkstra corresponds to OSPF\'s ordering of which prefix to compute next", "Graph algorithms are the mathematical foundation for all routing protocols"], title: 'Q14. The lecture connects graph algorithms to routing protocols. Which are correct?', correct: [0, 1, 4], why: [
      '✔ Full map + Dijkstra = link-state.',
      '✔ Hop count = unweighted edge count = BFS territory.',
      '❌ EVERY router in the area re-runs Dijkstra after flooding the change.',
      '❌ The PQ orders NODES by distance — not "which prefix next".',
      '✔ Routing = shortest-path problems in disguise.'] },
    { id: 'c4q15', stmts: ["Find minimum hop-count path from router A to router B → BFS", "Detect whether a routing loop exists in the network topology → DFS cycle detection", "Find the least-cost path (by link latency) from router A to router B → Dijkstra", "List all routers reachable from a given router → BFS or DFS (both work)", "Find the minimum-cost path when some links have negative costs → Dijkstra"], title: 'Q15. A network engineer must choose an algorithm for each task. Which pairings are correct?', correct: [0, 1, 2, 3], why: [
      '✔ Unweighted shortest = BFS.',
      '✔ Loops = DFS back-edge detection.',
      '✔ Weighted shortest (non-negative) = Dijkstra.',
      '✔ Coverage: either traversal works.',
      '❌ Negative costs need Bellman-Ford — Dijkstra breaks.'] },
    ],
    coding: [
    {
      num: 'Q16', title: 'First Depth First Search',
      problem: 'N towns (1…N). A directed edge A[i] → i+1 exists for every 1 ≤ i < N (A[0] = 1 is ignored), and it is guaranteed that A[i] ≤ i. Query: is town B reachable from town C? Return 1 or 0.',
      insight: 'Every edge points from a SMALLER label to a LARGER one (A[i] ≤ i < i+1). So a node can only reach its descendants — meaning B is reachable from C exactly when climbing parent-pointers from B lands on C. No DFS, no adjacency list, no recursion needed!',
      givenNote: 'The PDF\'s given solution builds an adjacency list and runs recursive DFS from C searching for B — correct, O(N) time and memory, but it needs recursion depth up to N (StackOverflowError territory for deep chains) and builds structures it never really needs.',
      given: `public int solve(int[] A, final int B, final int C) {
    graph();                       // build adjacency lists
    for (int i = 1; i < A.length; i++)
        adj.get(A[i]).add(i + 1);  // edge A[i] -> i+1
    return dfs(C, B) ? 1 : 0;      // DFS from C looking for B
}`,
      optimalTitle: 'Optimal: climb the parent chain (Java & C++) — O(depth) time, O(1) space, zero recursion',
      optimal: `// JAVA — climb parents from B; parents are always SMALLER, so B is
// reachable from C exactly when the climb lands on C.
public int solve(int[] A, int B, int C) {
    while (B > C) {
        B = A[B - 1];        // parent of node B (node k's parent = A[k-1])
    }
    return B == C ? 1 : 0;   // landed on C -> descendant -> reachable
}

// C++ — identical idea, one loop, no recursion, O(1) extra memory
int solve(vector<int>& A, int B, int C) {
    while (B > C) {
        B = A[B - 1];        // parent of node B
    }
    return B == C ? 1 : 0;
}`,
      optimalWhy: 'Why this is better: the A[i] ≤ i guarantee makes the graph a downward-growing tree. Descendants of C all have labels ≥ C, and each node has exactly one parent — so instead of exploring forward (branching DFS), just walk UP from B. The loop strictly decreases B, so it terminates; if we land on C, B is a descendant of C. Worst case still O(N) (a chain), but typically far less, with O(1) memory and no recursion — so neither Java\'s StackOverflowError nor a C++ segfault can touch it.',
      complexity: [['Given DFS', 'O(N) time · O(N) space · recursion depth up to N'], ['Parent climb', 'O(depth) time · O(1) space · no recursion']],
      viz: 'climb',
    },
    {
      num: 'Q17', title: 'Path in Directed Graph',
      problem: 'Directed graph with A nodes (1…A) and M edges in matrix B (B[i][0] → B[i][1]). Does a path exist from node 1 to node A? Return 1 or 0.',
      insight: 'Pure reachability — BFS or DFS from node 1, check if A is ever touched. The given solution already does BFS with O(A+M); the wins are (1) early-exit the moment A is reached, and (2) staying iterative so deep recursion can\'t bite.',
      givenNote: 'The PDF\'s Java solution runs BFS from node 1 with a visited array and ArrayDeque — already the right algorithm and complexity.',
      given: `public static boolean isReachable(int s, int d) {
    Queue<Integer> q = new ArrayDeque<>();
    q.offer(s); visited[s] = 1;
    while (q.size() > 0) {
        s = q.poll();
        for (int v : adj.get(s)) {
            if (v == d) return true;     // early exit
            if (visited[v] == 0) { visited[v] = 1; q.offer(v); }
        }
    }
    return false;
}`,
      optimalTitle: 'Optimal: iterative BFS with early exit (Java & C++) — O(A+M) time, O(A) space, recursion-proof',
      optimal: `// JAVA — iterative BFS with early exit: O(A+M) time, O(A) space
public int solve(int A, int[][] B) {
    List<List<Integer>> adj = new ArrayList<>();
    for (int i = 0; i <= A; i++) adj.add(new ArrayList<>());
    for (int[] e : B) adj.get(e[0]).add(e[1]);

    boolean[] seen = new boolean[A + 1];
    ArrayDeque<Integer> dq = new ArrayDeque<>();
    dq.add(1); seen[1] = true;
    while (!dq.isEmpty()) {
        int u = dq.poll();
        if (u == A) return 1;        // early exit the moment we touch the target
        for (int v : adj.get(u))
            if (!seen[v]) { seen[v] = true; dq.add(v); }
    }
    return 0;
}

// C++ — same BFS, recursion-free (a 1e5-node chain can't crash it)
int solve(int A, vector<vector<int>>& B) {
    vector<vector<int>> adj(A + 1);
    for (auto& e : B) adj[e[0]].push_back(e[1]);
    vector<bool> seen(A + 1, false);
    queue<int> q; q.push(1); seen[1] = true;
    while (!q.empty()) {
        int u = q.front(); q.pop();
        if (u == A) return 1;        // early exit
        for (int v : adj[u])
            if (!seen[v]) { seen[v] = true; q.push(v); }
    }
    return 0;
}`,
      optimalWhy: 'Same algorithm class as the given BFS (you cannot beat O(A+M) — you must potentially look at every node and edge), but this version exits the instant A is dequeued and never recurses — a 100,000-node chain would overflow the call stack in a recursive DFS (StackOverflowError in Java, segfault in C++), while iterative BFS is immune.',
      complexity: [['Given BFS (Java)', 'O(A+M) time · O(A+M) space'], ['This BFS (Java & C++)', 'O(A+M) time · O(A+M) space — with early exit + no recursion-depth risk']],
      viz: 'reach',
    },
    {
      num: 'Q18', title: 'Cycle in Directed Graph',
      problem: 'Directed graph with A nodes and M edges. Return 1 if the graph contains a cycle (≥ 2 nodes), else 0.',
      insight: 'Two classic tools: (1) DFS with a recursion-stack marker — the given solution; (2) Kahn\'s topological sort — repeatedly peel nodes with in-degree 0. If nodes remain unpeeled, they are stuck behind a cycle. Kahn\'s is iterative (no stack overflow) and gives you a topological order for free.',
      givenNote: 'The PDF\'s solution runs DFS from every unvisited node carrying visited[] + recStack[]; a back edge into a node on the current recursion stack ⇒ cycle. Correct and O(A+M), but recursive.',
      given: `public static boolean isCyclicUtil(int v) {
    visited[v] = 1; recStack[v] = 1;
    for (int u : adj.get(v)) {
        if (visited[u] == 0 && isCyclicUtil(u)) return true;
        else if (recStack[u] == 1) return true;   // back edge!
    }
    recStack[v] = 0;      // leave the recursion stack
    return false;
}`,
      optimalTitle: 'Optimal: Kahn\'s algorithm — iterative topological peeling, O(A+M), recursion-proof',
      optimal: `// JAVA — Kahn's algorithm: peel in-degree-0 nodes; leftovers = cycle
public int solve(int A, int[][] B) {
    List<List<Integer>> adj = new ArrayList<>();
    int[] indeg = new int[A + 1];
    for (int i = 0; i <= A; i++) adj.add(new ArrayList<>());
    for (int[] e : B) { adj.get(e[0]).add(e[1]); indeg[e[1]]++; }

    ArrayDeque<Integer> dq = new ArrayDeque<>();
    for (int i = 1; i <= A; i++) if (indeg[i] == 0) dq.add(i);

    int peeled = 0;
    while (!dq.isEmpty()) {
        int u = dq.poll();
        peeled++;
        for (int v : adj.get(u))
            if (--indeg[v] == 0) dq.add(v);
    }
    // every node on or behind a cycle never reaches in-degree 0
    return peeled == A ? 0 : 1;
}

// C++ — same peeling, iterative, no recursion-depth risk
int solve(int A, vector<vector<int>>& B) {
    vector<vector<int>> adj(A + 1);
    vector<int> indeg(A + 1, 0);
    for (auto& e : B) { adj[e[0]].push_back(e[1]); indeg[e[1]]++; }
    queue<int> q;
    for (int i = 1; i <= A; i++) if (indeg[i] == 0) q.push(i);
    int peeled = 0;
    while (!q.empty()) {
        int u = q.front(); q.pop(); peeled++;
        for (int v : adj[u]) if (--indeg[v] == 0) q.push(v);
    }
    return peeled == A ? 0 : 1;   // leftover nodes are on/behind a cycle
}`,
      optimalWhy: 'Why leftover nodes mean a cycle: a node\'s in-degree only hits 0 when ALL its predecessors were peeled. Inside a cycle, every node waits on another cycle member forever — so they never peel. If peeled == A the graph is a DAG (and you get its topological order for free). Same O(A+M), but a million-node chain cannot crash it.',
      complexity: [['Given DFS + recStack', 'O(A+M) time · recursion depth up to A'], ['Kahn\'s peeling', 'O(A+M) time · iterative — no recursion, plus free topo order']],
      viz: 'peel',
    },
    {
      num: 'Q19', title: 'Dijkstra',
      problem: 'Weighted UNDIRECTED graph, A nodes, M edges (u, v, w) in matrix B, source C. Return array D where D[i] = shortest distance from C to i, or −1 if unreachable.',
      insight: 'Textbook Dijkstra with a min-heap: pop the closest unfinalised node, relax its edges, push improved distances. The "lazy deletion" pattern (skip popped entries that are stale) is the standard heapq idiom — the given Java/C++ solutions already use it.',
      givenNote: 'The PDF\'s Java solution uses a PriorityQueue of (dist, node) pairs with a custom comparator and a visited skip — the same pattern the heap versions below express more compactly.',
      given: `public static int[] dijkstra(int n, int source) {
    PriorityQueue<Pair> pq = new PriorityQueue<>(new CustomComp());
    int[] dist = new int[n];
    Arrays.fill(dist, Integer.MAX_VALUE);
    dist[source] = 0;
    pq.offer(new Pair(0, source));
    while (pq.size() != 0) {
        Pair temp = pq.poll();
        int u = temp.b;
        if (vis[u] == 1) continue;      // stale entry — skip
        vis[u] = 1;
        for (Pair e : adj.get(u)) {
            int v = e.b, w = e.a;
            if (dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                pq.offer(new Pair(dist[v], v));
            }
        }
    }
    for (int i = 0; i < n; i++) if (dist[i] == Integer.MAX_VALUE) dist[i] = -1;
    return dist;
}`,
      optimalTitle: 'Optimal: heap-based Dijkstra (Java & C++) — O((A+M) log A), with the stale-entry skip',
      optimal: `// JAVA — Dijkstra with a PriorityQueue (min-heap of cost, node)
public int[] solve(int A, int[][] B, int C) {
    List<List<int[]>> adj = new ArrayList<>();     // (neighbour, weight)
    for (int i = 0; i < A; i++) adj.add(new ArrayList<>());
    for (int[] e : B) {                            // undirected: both ways
        adj.get(e[0]).add(new int[]{e[1], e[2]});
        adj.get(e[1]).add(new int[]{e[0], e[2]});
    }
    int INF = Integer.MAX_VALUE;
    int[] dist = new int[A];
    Arrays.fill(dist, INF);
    dist[C] = 0;
    PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> a[0] - b[0]);
    pq.add(new int[]{0, C});
    while (!pq.isEmpty()) {
        int[] top = pq.poll();
        int d = top[0], u = top[1];
        if (d > dist[u]) continue;                 // stale entry — skip
        for (int[] e : adj.get(u)) {
            int nd = d + e[1];
            if (nd < dist[e[0]]) {
                dist[e[0]] = nd;
                pq.add(new int[]{nd, e[0]});
            }
        }
    }
    for (int i = 0; i < A; i++) if (dist[i] == INF) dist[i] = -1;
    return dist;
}

// C++ — the classic competitive-programming form
vector<int> solve(int A, vector<vector<int>>& B, int C) {
    vector<vector<pair<int,int>>> adj(A);          // (neighbour, weight)
    for (auto& e : B) {
        adj[e[0]].push_back({e[1], e[2]});
        adj[e[1]].push_back({e[0], e[2]});
    }
    const int INF = INT_MAX;
    vector<int> dist(A, INF);
    dist[C] = 0;
    priority_queue<pair<int,int>, vector<pair<int,int>>, greater<>> pq;
    pq.push({0, C});
    while (!pq.empty()) {
        auto [d, u] = pq.top(); pq.pop();
        if (d > dist[u]) continue;                 // stale entry — skip
        for (auto& [v, w] : adj[u]) {
            if (d + w < dist[v]) {
                dist[v] = d + w;
                pq.push({dist[v], v});
            }
        }
    }
    for (int& d : dist) if (d == INF) d = -1;
    return dist;
}`,
      optimalWhy: 'Verified against both assignment examples: input 1 → [7, 6, 5, 6, 0, 6] ✓, input 2 → [14, 18, 13, 10, 0] ✓. The `if (d > dist[u]) continue;` check replaces the visited[] array — a popped pair is stale if a shorter distance was already recorded. Complexity is optimal for comparison-based Dijkstra: O((A+M) log A).',
      complexity: [['Given (Java/C++)', 'O((A+M) log A) time · O(A+M) space'], ['heapq version', 'O((A+M) log A) time · O(A+M) space — same class, less code']],
      viz: 'dijkstra',
    },
    ],
  },
  {
    id: 5, title: 'Graph Algorithms for Networking II', lecture: 6, color: '#83268f',
    mcqs: [
    { id: 'c5q1', stmts: ["Dijkstra\'s greedy assumption is that once a node is finalized, its shortest distance cannot be improved", "Negative edges allow a later-explored node to offer a cheaper path to an already-finalized node", "Dijkstra simply refuses to process negative edges and throws an error", "The priority queue in Dijkstra would contain negative values, which heapq cannot handle", "In the lecture\'s A→B(2), A→C(4), C→B(-3) example, Dijkstra wrongly reports A→B cost as 2 instead of 1"], title: 'Q1. Why does Dijkstra fail on negative edge weights?', correct: [0, 1, 4], why: [
      '✔ The greedy bet: finalised = final. Negatives break the bet.',
      '✔ A later node with a negative edge can sneak a cheaper path to a "done" node.',
      '❌ Dijkstra happily processes negatives — it just returns WRONG answers.',
      '❌ heapq handles negative numbers fine.',
      '✔ The lecture\'s exact counterexample: A→B(2), A→C(4), C→B(−3) → true answer 1, Dijkstra says 2.'] },
    { id: 'c5q2', stmts: ["Bellman-Ford relaxes ALL edges in the graph in every iteration", "Bellman-Ford runs for exactly V-1 iterations (where V is the number of vertices)", "The reason for V-1 iterations is that the longest simple path in a V-node graph has V-1 edges", "Bellman-Ford is a greedy algorithm like Dijkstra but with negative edge support", "After V-1 iterations, if any edge can still be relaxed, a negative cycle exists"], title: 'Q2. Which correctly describe the Bellman-Ford algorithm?', correct: [0, 1, 2, 4], why: [
      '✔ Relax every edge, every pass — no priority queue.',
      '✔ V−1 passes.',
      '✔ A shortest simple path never repeats a node → ≤ V−1 edges.',
      '❌ BF is the anti-greedy: brute-force relaxation until stable.',
      '✔ The V-th pass improving = negative cycle.'] },
    { id: 'c5q3', stmts: ["After Iteration 1: dist[A]=0, dist[B]=1, dist[C]=4", "After Iteration 1: dist[B] is first updated to 2 via edge A→B, then updated to 1 via C→B", "After Iteration 2, the distances remain stable (no further updates)", "The final shortest distance from A to B is 1, via the path A→C→B", "Bellman-Ford would need a third iteration to correctly compute this answer"], title: 'Q3. Bellman-Ford trace — A→B(2), A→C(4), C→B(−3), from A:', correct: [0, 1, 2, 3], why: [
      '✔ End of pass 1: B=1 (via C), C=4, A=0.',
      '✔ Within pass 1: A→B sets 2, then C→B improves to 1.',
      '✔ Pass 2 changes nothing — already optimal.',
      '✔ A→C→B = 4−3 = 1.',
      '❌ V−1 = 2 passes; a third is never needed.'] },
    { id: 'c5q4', stmts: ["After V-1 normal iterations, one additional (V-th) pass is performed over all edges", "If any edge (u, v, w) satisfies dist[u] + w < dist[v] in the V-th pass, a negative cycle exists", "A negative cycle means shortest paths don\'t exist — you can always reduce the cost by going around the cycle", "Bellman-Ford returns \"negative cycle detected\" and aborts, making no route computation possible", "Negative cycles in routing correspond to routing loops where packets can reduce their cost indefinitely"], title: 'Q4. Which correctly describe negative cycle detection?', correct: [0, 1, 2, 4], why: [
      '✔ The V-th pass is the detector.',
      '✔ Any improvement on pass V = something looped.',
      '✔ Around the loop forever, cost keeps dropping — no shortest path exists.',
      '❌ BF reports the cycle; paths avoiding it are still computable.',
      '✔ In routing: a loop whose metric keeps "improving" = count-to-infinity\'s evil twin.'] },
    { id: 'c5q5', stmts: ["Bellman-Ford has time complexity O(V·E); Dijkstra with binary heap has O((V+E) log V)", "Bellman-Ford handles negative edge weights; Dijkstra does not", "Dijkstra is faster for graphs with non-negative edges", "Bellman-Ford uses a priority queue; Dijkstra uses exhaustive relaxation", "Bellman-Ford can detect negative cycles; Dijkstra cannot"], title: 'Q5. Which correctly compare Bellman-Ford and Dijkstra?', correct: [0, 1, 2, 4], why: [
      '✔ BF: O(V·E). Dijkstra+heap: O((V+E) log V).',
      '✔ The whole reason BF exists.',
      '✔ Non-negative → Dijkstra wins on speed.',
      '❌ Swapped! BF relaxes everything; Dijkstra uses the priority queue.',
      '✔ Only BF\'s extra pass spots negative cycles.'] },
    { id: 'c5q6', stmts: ["An MST connects all V vertices using exactly V-1 edges", "An MST contains no cycles", "An MST minimizes the total weight of the edges used to connect all nodes", "Every graph has exactly one unique MST", "An MST is a subgraph of the original graph"], title: 'Q6. Which correctly describe a Minimum Spanning Tree?', correct: [0, 1, 2, 4], why: [
      '✔ V nodes, V−1 edges, connected.',
      '✔ Tree = acyclic by definition.',
      '✔ Minimum total weight among all spanning trees.',
      '❌ Equal weights can produce multiple valid MSTs.',
      '✔ Every MST edge is an original graph edge.'] },
    { id: 'c5q7', stmts: ["STP prevents Layer 2 loops in Ethernet networks with redundant switch connections", "STP identifies redundant links and logically disables them to create a loop-free tree", "If a primary link fails, STP can recalculate and re-enable previously blocked links", "STP runs at Layer 3 and uses IP addresses to detect loops", "Without STP, a broadcast frame on a looped network would circulate forever"], title: 'Q7. How does MST apply to the Spanning Tree Protocol?', correct: [0, 1, 2, 4], why: [
      '✔ Redundant switches + broadcasts = storms; STP is the cure.',
      '✔ Blocks redundant ports → a loop-free logical tree.',
      '✔ Re-converges around failures by unblocking.',
      '❌ STP is LAYER 2 — frames and MACs, no IP involved.',
      '✔ No STP → broadcast storm → switches melted.'] },
    { id: 'c5q8', stmts: ["In distance vector, each router shares its routing table only with its direct neighbors", "In link state, each router floods its local link information to ALL routers in the network", "Distance vector routers have a complete map of the entire network topology", "Link state routers independently run Dijkstra on the same complete topology map", "RIP is a distance-vector protocol; OSPF is a link-state protocol"], title: 'Q8. Distance-vector vs link-state — which distinguish them?', correct: [0, 1, 3, 4], why: [
      '✔ DV: "tell your NEIGHBOURS the whole map".',
      '✔ LS: "tell EVERYONE your neighbourhood".',
      '❌ DV routers only know neighbour-reported hearsay.',
      '✔ Same map + same algorithm = consistent routing.',
      '✔ The classic pairing.'] },
    { id: 'c5q9', stmts: ["Count-to-infinity occurs when two routers falsely believe they can reach a destination through each other after a link fails", "RIP sets a maximum metric of 16 to limit how high hop counts can rise before declaring a route unreachable", "Split horizon prevents count-to-infinity by not advertising a route back to the neighbor it was learned from", "Count-to-infinity is the primary reason OSPF was designed as a link-state protocol", "Without a maximum metric, count-to-infinity would cause hop counts to increment to infinity and the problem would eventually resolve itself"], title: 'Q9. Which correctly describe the count-to-infinity problem?', correct: [0, 1, 2, 3], why: [
      '✔ The mutual-hallucination after a link dies.',
      '✔ 16 = "infinity" in RIP — the leash.',
      '✔ Don\'t echo routes back where you learned them.',
      '✔ DV\'s slow death is why OSPF floods link-state instead.',
      '❌ Without the leash it NEVER resolves — counts forever.'] },
    { id: 'c5q10', stmts: ["Distance vector routing is a distributed implementation of the Bellman-Ford algorithm", "Each router\'s periodic table exchange corresponds to one relaxation pass of Bellman-Ford", "In the distributed version, a router only relaxes edges connecting to its own neighbors", "Like Bellman-Ford, distance vector routing requires all edge information to be known globally", "The convergence of distance vector routing after a topology change mirrors Bellman-Ford reaching a stable solution"], title: 'Q10. How does Bellman-Ford relate to distance-vector routing?', correct: [0, 1, 2, 4], why: [
      '✔ DV = BF distributed across routers.',
      '✔ Each gossip round ≈ one relaxation pass.',
      '✔ Routers only know their own links — relax those.',
      '❌ The beauty: NO global knowledge needed.',
      '✔ Stable tables = converged BF.'] },
    { id: 'c5q11', stmts: ["An Autonomous System (AS) is a network under one administrative domain (e.g., an ISP or large organization)", "OSPF is used for routing WITHIN an AS (interior gateway protocol)", "BGP is used for routing BETWEEN ASes (exterior gateway protocol)", "All routers on the internet run OSPF to find shortest paths across the entire internet", "Inside an AS, OSPF routers run Dijkstra on a complete topology map"], title: 'Q11. Which correctly describe the internet\'s routing architecture?', correct: [0, 1, 2, 4], why: [
      '✔ One admin domain = one AS (ISP, big org).',
      '✔ Interior = OSPF/IS-IS inside the AS.',
      '✔ Exterior = BGP between ASes.',
      '❌ OSPF can\'t scale to the whole internet — that\'s BGP\'s kingdom.',
      '✔ Inside the AS: full map + Dijkstra.'] },
    ],
  },
  {
    id: 6, title: 'Routing and Forwarding I', lecture: 7, color: '#b45309',
    mcqs: [
    { id: 'c6q1', stmts: ["Routing is the process of deciding where packets should go — building and maintaining routing tables", "Forwarding is the act of actually sending a packet out a specific interface based on the routing table", "Routing happens in the control plane; forwarding happens in the data plane", "Forwarding is performed once per network session; routing is performed for every packet", "Forwarding happens millions of times per second and is often implemented in dedicated hardware (ASICs)"], title: 'Q1. Which correctly distinguish routing from forwarding?', correct: [0, 1, 2, 4], why: [
      '✔ Routing = the brain: build the map.',
      '✔ Forwarding = the muscle: ship the packet.',
      '✔ Control plane plans; data plane executes.',
      '❌ Backwards — forwarding happens PER PACKET; routing updates the table periodically.',
      '✔ Nanosecond lookups in silicon (ASICs/TCAM).'] },
    { id: 'c6q2', stmts: ["The destination network field specifies which network prefix this route applies to", "The next-hop field contains the IP address of the next router to send the packet to", "The interface field specifies which physical port the packet should exit through", "The metric field represents the cost of the route — lower values are preferred", "The routing table contains the full path (all intermediate hops) to every destination"], title: 'Q2. Which correctly describe routing-table fields?', correct: [0, 1, 2, 3], why: [
      '✔ The prefix this entry covers.',
      '✔ Where to hand off next.',
      '✔ Which port to exit.',
      '✔ Tie-breaker among equal routes — lower wins.',
      '❌ Tables hold only the NEXT hop — never the full path.'] },
    { id: 'c6q3', stmts: ["When multiple routing table entries match a destination IP, the entry with the most specific prefix (most bits matching) is used", "A /28 match takes precedence over a /16 match for the same destination IP", "The default route 0.0.0.0/0 matches every destination IP address", "LPM means the entry with the longest network address (highest IP value) wins", "LPM allows hierarchical routing — general routes coexist with more specific ones"], title: 'Q3. Which correctly describe the Longest Prefix Match rule?', correct: [0, 1, 2, 4], why: [
      '✔ Most specific prefix wins.',
      '✔ 28 bits > 16 bits — specificity beats generality.',
      '✔ 0 matching bits = matches everything.',
      '❌ It\'s about PREFIX LENGTH, not the numeric value of the address.',
      '✔ Default routes and specific routes coexist because of LPM.'] },
    { id: 'c6q4', stmts: ["All four routing entries match the destination 192.168.1.200", "The router uses the entry 192.168.1.128/25 via 10.0.0.3", "192.168.1.200 falls within the range 192.168.1.128–192.168.1.255, confirming the /25 match", "The /16 entry is used because it was added first to the routing table", "The default route 0.0.0.0/0 is used when no other entry matches"], title: 'Q4. Table: 192.168.0.0/16, 192.168.1.0/24, 192.168.1.128/25, 0.0.0.0/0. Destination 192.168.1.200 — which are correct?', correct: [0, 1, 2, 4], why: [
      '✔ .200 fits /16, /24, /25 (.128–.255), and the default — all four match.',
      '✔ LPM: 25 bits is the longest match → via 10.0.0.3.',
      '✔ .200 ≥ .128 and ≤ .255 — inside the /25.',
      '❌ Order in the table is irrelevant — LPM decides.',
      '✔ The default is the last resort by definition.'] },
    { id: 'c6q5', stmts: ["The default route is written as 0.0.0.0/0 in CIDR notation", "The default route matches any destination IP address (0 bits need to match)", "The default route has the lowest priority in routing table lookups — it\'s only used when nothing more specific matches", "Tier-1 internet backbone routers typically have only a default route and no specific prefixes", "On a home router, the default route typically points to the ISP\'s gateway"], title: 'Q5. Which correctly describe the default route?', correct: [0, 1, 2, 4], why: [
      '✔ 0.0.0.0/0 — zero prefix bits.',
      '✔ Every destination matches it.',
      '✔ Everything more specific wins first.',
      '❌ Tier-1 routers carry the FULL global table and no default — they ARE the default-free zone.',
      '✔ Home router: "everything else → ISP".'] },
    { id: 'c6q6', stmts: ["Static routes are manually configured by a network administrator", "Static routes do not automatically update if the next-hop router goes offline", "Static routes are appropriate for stub networks with a single path in and out", "Static routes automatically learn from routing protocol updates", "A floating static route has a high metric and serves as a backup when a primary dynamic route disappears"], title: 'Q6. Which correctly describe static routes?', correct: [0, 1, 2, 4], why: [
      '✔ Typed in by a human.',
      '✔ No automatic failover — the admin\'s problem.',
      '✔ Perfect for stub networks: one door in, one door out.',
      '❌ Learning from protocols is the definition of DYNAMIC routes.',
      '✔ Floating static = high metric backup route.'] },
    { id: 'c6q7', stmts: ["TTL starts at a value (typically 64 or 128) set by the sending host", "Each router along the path decrements the TTL by 1", "When TTL reaches 0, the router discards the packet and sends an ICMP Time Exceeded message back to the source", "TTL prevents packets from looping forever in the case of routing loops", "TTL is decremented by the destination host, not by intermediate routers"], title: 'Q7. Which correctly describe the TTL field?', correct: [0, 1, 2, 3], why: [
      '✔ 64 (Linux/Mac) or 128 (Windows) typical.',
      '✔ Every hop: TTL − 1.',
      '✔ 0 → drop + ICMP Time Exceeded (that\'s how traceroute works!).',
      '✔ The loop-breaking seatbelt.',
      '❌ Backwards — routers decrement; the destination never touches TTL.'] },
    { id: 'c6q8', stmts: ["The IP source address stays 192.168.1.5 throughout (absent NAT)", "The IP destination address stays 10.50.20.100 throughout", "The Ethernet source MAC address changes at each router hop", "The Ethernet destination MAC address changes at each router hop", "The TCP sequence number is decremented by each router"], title: 'Q8. Laptop 192.168.1.5 → server 10.50.20.100 via 3 routers. What changes at each router?', correct: [0, 1, 2, 3], why: [
      '✔ Source IP end-to-end (no NAT on the path).',
      '✔ Destination IP end-to-end.',
      '✔ New frame per link → new source MAC.',
      '✔ And new destination MAC (next hop).',
      '❌ Routers never modify TCP state — payload is untouchable.'] },
    { id: 'c6q9', stmts: ["The routing table is the router\'s decision database of known networks and how to reach them", "The routing algorithm determines how the router learns and updates routes", "The forwarding engine does the actual packet lookup and dispatching — often in hardware", "A router operates at Layer 2, using MAC addresses to forward frames within a LAN", "Modern routers use TCAM (Ternary Content-Addressable Memory) for fast hardware-based LPM lookups"], title: 'Q9. Which correctly describe the components of a router?', correct: [0, 1, 2, 4], why: [
      '✔ The decision database.',
      '✔ How routes are learned/maintained (static, OSPF, BGP…).',
      '✔ The fast path: lookup + dispatch.',
      '❌ That\'s a SWITCH — routers live at Layer 3.',
      '✔ TCAM = ternary matching = wire-speed LPM.'] },
    { id: 'c6q10', stmts: ["R1 matches the packet against all routing entries and selects 10.50.0.0/16 (more specific than default)", "R1 forwards the packet out interface eth1 toward 10.0.0.2", "After R1 forwards, the Ethernet frame\'s destination MAC becomes R1's own MAC (keeping the old Ethernet frame)", "The IP destination address in the packet is still 10.50.20.100 when it leaves R1", "R1 also changes the IP source address to its own WAN IP before forwarding"], title: 'Q10. R1\'s table: 10.50.0.0/16 via 10.0.0.2 (eth1), 0.0.0.0/0 via 10.0.0.2 (eth1). Packet to 10.50.20.100 — which are correct?', correct: [0, 1, 3], why: [
      '✔ Both entries match; /16 is longer → wins.',
      '✔ Next hop 10.0.0.2, out eth1.',
      '❌ A NEW frame is built with next-hop\'s MAC — the old frame dies at R1.',
      '✔ IP header untouched by forwarding (no NAT here).',
      '❌ Routers don\'t NAT unless configured to.'] },
    { id: 'c6q11', stmts: ["A switch operates at Layer 2, forwarding Ethernet frames using MAC addresses within a LAN", "A router operates at Layer 3, forwarding IP packets between different networks", "A switch can route packets between different IP subnets", "A router maintains a routing table; a switch maintains a MAC address table (CAM table)", "A packet destined for a different network must pass through a router, not just a switch"], title: 'Q11. Which correctly distinguish a router from a switch?', correct: [0, 1, 3, 4], why: [
      '✔ Switch = frames + MACs + one LAN.',
      '✔ Router = packets + IPs + between networks.',
      '❌ Subnet-hopping is the router\'s superpower, not the switch\'s.',
      '✔ Different brains for different layers.',
      '✔ Cross-subnet traffic needs L3 — a switch alone can\'t.'] },
    { id: 'c6q12', stmts: ["192.168.10.0/24 → directly connected on eth0", "192.168.20.0/24 → directly connected on eth1", "10.1.1.0/30 → directly connected on eth2", "0.0.0.0/0 → via 10.1.1.2 on eth2 (default route for internet)", "8.8.8.0/24 → directly connected on eth2 (Google\'s subnet)"], title: 'Q12. R1 joins Eng LAN (192.168.10.0/24, eth0), Marketing LAN (192.168.20.0/24, eth1), WAN 10.1.1.0/30 (eth2), internet via 10.1.1.2. Which table entries are correct?', correct: [0, 1, 2, 3], why: [
      '✔ Own LANs appear as directly connected.',
      '✔ Second LAN, second interface.',
      '✔ The WAN link itself is a directly connected /30.',
      '✔ Everything else → ISP router 10.1.1.2.',
      '❌ 8.8.8.0/24 is not attached — it\'s reached via the default route.'] },
    ],
  },
  {
    id: 7, title: 'Past Quiz — CN Quiz (2029 Batch, Groups A+B)', lecture: 13, color: '#6d28d9',
    mcqs: [
    { id: 'z1', title: 'Q1. OSI Layer PDU and Addressing Match', correct: [0, 1, 2, 4], stmts: ["Layer 3 (Network) -> Packet -> identified by source/destination IP addresses","Layer 4 (Transport) -> Segment -> identified by source/destination port numbers","Layer 2 (Data Link) -> Frame -> identified by source/destination MAC addresses","Layer 7 (Application) -> Message -> identified by source/destination MAC addresses","Layer 1 (Physical) -> Bit -> no addressing; raw signal on the medium"], why: [
      '✔ Packet + IP addresses — the L3 pair is exact.',
      '✔ Segment + ports — the L4 pair is exact.',
      '✔ Frame + MACs — the L2 pair is exact.',
      '❌ Application messages carry no MACs — addressing at L7 is application-specific (URLs, emails).',
      '✔ Bits with no addressing — Physical just moves signals.'] },
    { id: 'z2', title: 'Q2. RFC 1918 Edge Case: 172.31.200.1', correct: [0, 1, 3, 4], stmts: ["This address is in the RFC 1918 private address space","This address falls within the 172.16.0.0/12 range","This address is publicly routable on the internet","172.32.0.1 would be a public IP address (outside RFC 1918)","The entire 172.16.0.0/12 block covers addresses from 172.16.0.0 to 172.31.255.255"], why: [
      '✔ 172.16–172.31 is the private /12 — 172.31.200.1 is inside it.',
      '✔ /12 = 12 network bits → second octet 16–31.',
      '❌ Private addresses are never internet-routable.',
      '✔ 172.32 is the first octet-2 value OUTSIDE the block → public.',
      '✔ /12 spans 20 host bits: 172.16.0.0 – 172.31.255.255.'] },
    { id: 'z3', title: 'Q3. IPv6 Compression Rule Violations', correct: [0, 2, 3], stmts: ["2001:0db8:0000:0000:0001:0000:0000:0001 correctly compresses to 2001:db8::1:0:0:1","2001:db8::1::2 is a valid compressed IPv6 address","Leading zeros within each 16-bit group can always be dropped","fe80::1 could represent a valid link-local IPv6 address","The :: can only replace a single group of zeros, not multiple consecutive groups"], why: [
      '✔ Two equal-length zero runs → :: takes the LEFTMOST (RFC 5952); the second run becomes :0:0:.',
      '❌ :: may appear only ONCE per address.',
      '✔ Leading zeros are per-group optional — 0db8 → db8, 0000 → 0.',
      '✔ fe80::/10 is link-local — fe80::1 is the canonical example.',
      '❌ Backwards — :: replaces ONE OR MORE consecutive all-zero groups.'] },
    { id: 'z4', title: 'Q4. BFS vs Dijkstra Correctness Guarantees', correct: [0, 1, 3], stmts: ["BFS guarantees the minimum-hop (fewest edges) path in an unweighted graph","Dijkstra guarantees the minimum-cost path in a graph with non-negative edge weights","BFS guarantees the minimum-cost path in any weighted graph","Dijkstra uses a priority queue (min-heap), not a simple FIFO queue","BFS and Dijkstra produce identical results on any graph"], why: [
      "✔ BFS\'s exact guarantee.",
      "✔ Dijkstra\'s exact guarantee (non-negative is the fine print).",
      '❌ BFS ignores weights entirely.',
      '✔ The PQ is what makes Dijkstra Dijkstra.',
      '❌ On weighted graphs they diverge — see the 1-hop-cost-100 trap.'] },
    { id: 'z5', title: 'Q5. When Bellman-Ford Wins Over Dijkstra', correct: [0, 1, 3], stmts: ["The graph contains edges with negative weights","The algorithm must detect negative-weight cycles","Bellman-Ford converges faster than Dijkstra in all graph topologies","Bellman-Ford can find correct shortest paths in graphs where Dijkstra would silently produce wrong answers","Bellman-Ford has lower time complexity than Dijkstra for sparse graphs"], why: [
      '✔ Negative weights = Dijkstra disqualified.',
      "✔ Only BF\'s extra pass spots negative cycles.",
      '❌ O(V·E) never beats Dijkstra on speed — the win is CORRECTNESS, not pace.',
      '✔ Silent wrong answers are worse than slow right ones.',
      '❌ Sparse: BF is O(V²)-ish vs Dijkstra\'s O(V log V) — slower.'] },
    { id: 'z6', title: 'Q6. MST: Key Properties and Cut Property', correct: [0, 1, 2, 4], stmts: ["An MST of a connected graph with V vertices always has exactly V−1 edges","If a unique minimum-weight edge crosses any partition (cut) of the graph\'s vertices, that edge must appear in every MST of the graph","A graph can have more than one valid MST when multiple spanning trees tie on total weight due to equal edge weights","The MST guarantees the shortest path between every pair of vertices in the original graph","Replacing any MST edge with a non-MST edge (while keeping the result a spanning tree) can only maintain or increase the total weight — never decrease it"], why: [
      '✔ Trees: V nodes, V−1 edges, connected.',
      '✔ The cut property with uniqueness — locked into every MST.',
      '✔ Ties allow multiple MSTs (same total weight).',
      "❌ That\'s a shortest-path tree\'s property — MST minimises TOTAL weight, not pairwise hops.",
      '✔ By definition of minimum — swapping can never reduce it.'] },
    { id: 'z7', title: 'Q7. Circuit vs Packet Switching Tradeoffs', correct: [0, 1, 2, 3], stmts: ["Circuit switching guarantees a fixed bandwidth for the duration of the call; packet switching does not","In packet switching, a physical link can be statistically shared by thousands of simultaneous connections","Circuit switching wastes reserved bandwidth during silence in a voice call","Packet switching introduces variable delay (jitter) because packets queue behind others at each router","Circuit switching is more efficient than packet switching for bursty web browsing traffic"], why: [
      '✔ Reserved path = guaranteed bandwidth — the whole point of circuits.',
      '✔ Statistical multiplexing — packets interleave freely.',
      '✔ Reserved-but-idle = wasted — the classic phone-network cost.',
      '✔ Queueing = jitter — why real-time traffic hates packet switching.',
      '❌ Backwards — bursty traffic is exactly what statistical sharing wins at.'] },
    { id: 'z8', title: 'Q8. Longest Prefix Match with Five Entries (dest 10.20.30.100)', correct: [0, 1, 2, 3, 4], stmts: ["All five routing table entries match the destination 10.20.30.100","The router forwards the packet to GW4 using Longest Prefix Match","10.20.30.100 falls within the range 10.20.30.64 to 10.20.30.127","The /26 subnet covers exactly 64 addresses","If the /26 entry were removed, the router would forward to GW3 (/24)"], why: [
      '✔ /8 ✓, /16 ✓, /24 ✓, /26 (.64–.127) ✓, default ✓ — all five match.',
      '✔ 26 bits is the longest match → GW4.',
      '✔ /26 block: .64–.127.',
      '✔ 2⁶ = 64 total.',
      '✔ Next-longest surviving match = the /24 → GW3.'] },
    { id: 'z9', title: 'Q9. /28 Subnet Address Boundaries (192.168.10.0/28)', correct: [0, 1, 3, 4], stmts: ["The subnet mask in dotted-decimal is 255.255.255.240","The subnet contains 16 total addresses and 14 usable host addresses","The broadcast address is 192.168.10.16","192.168.10.14 is the last valid host address in this subnet","192.168.10.17 belongs to the next /28 subnet (192.168.10.16/28)"], why: [
      '✔ /28 = 28 ones = 255.255.255.240.',
      '✔ 2⁴ = 16 total, −2 = 14 usable.',
      "❌ Broadcast is .15 — .16 is the NEXT subnet\'s network address.",
      '✔ Last usable = broadcast − 1 = .14.',
      '✔ Blocks of 16: .0–.15, then .16–.31 → .17 is inside the next one.'] },
    { id: 'z10', title: 'Q10. VLSM: Four-Department Allocation (172.16.5.0/24)', correct: [0, 1, 3, 4], stmts: ["Dept A is assigned 172.16.5.0/26 (range .0-.63)","Dept B is assigned 172.16.5.64/27 (range .64-.95)","Dept C is assigned 172.16.5.96/27 to avoid wasting address space","Dept C is correctly assigned 172.16.5.96/28 (range .96-.111)","After allocating all four departments, unused address space remains within the /24"], why: [
      '✔ 50 hosts → /26 (62 usable), allocated first.',
      '✔ 25 hosts → /27 (30 usable), next block .64–.95.',
      '❌ A /27 for 10 hosts WASTES addresses — C needs /28.',
      '✔ /28 at .96–.111 — right-sized.',
      '✔ D takes /30 at .112; .116–.255 stays free.'] },
    { id: 'z11', title: 'Q11. NAT: What Gets Rewritten (192.168.1.100:54321 → 8.8.8.8:53)', correct: [0, 1, 3], stmts: ["The router rewrites the source IP to 203.0.113.10 and the source port to 10001 in the outbound packet","Google\'s server at 8.8.8.8 sees the connection originating from 203.0.113.10:10001","The router also rewrites the destination IP (8.8.8.8) when forwarding the packet","When the DNS response returns to 203.0.113.10:10001, the router translates the destination back to 192.168.1.100:54321","If two different laptops simultaneously connect to 8.8.8.8:53, they must both use the same public port (10001)"], why: [
      '✔ Outbound SNAT: source IP + port both rewritten.',
      '✔ The outside world only ever sees the public pair.',
      '❌ Destination stays 8.8.8.8 — NAT touches the SOURCE going out.',
      '✔ The reverse lookup: public port 10001 → private .100:54321.',
      '❌ Each connection gets its OWN public port — that\'s how they\'re told apart.'] },
    { id: 'z12', title: 'Q12. Dijkstra Step-by-Step: A-B-C-D-E Graph', correct: [0, 1, 2, 3], stmts: ["C is the first node finalized, at distance 2","B is finalized at distance 4","The shortest path from A to D is A->B->D with total cost 5","The shortest path from A to E is A->C->E with total cost 5","D is reached optimally via C->D (cost 2+5=7)"], why: [
      '✔ Frontier after A: C=2 < B=4 → C first.',
      '✔ B next at 4 (then D=5 via B, E=5 via C).',
      '✔ A→B→D = 4+1 = 5 beats A→C→D = 7.',
      '✔ A→C→E = 2+3 = 5.',
      '❌ Via C costs 7 — the optimal is via B at 5.'] },
    { id: 'z13', title: 'Q13. Bellman-Ford Guarantees and Complexity', correct: [0, 1, 2, 3], stmts: ["Bellman-Ford correctly finds shortest paths in graphs with negative edge weights, provided no negative-weight cycle is reachable from the source","For a graph with V vertices, Bellman-Ford is guaranteed to converge after at most V-1 relaxation iterations","A negative-weight cycle can be detected by running a V-th iteration - if any distance still decreases, a negative cycle exists","Bellman-Ford runs in O(V x E) time, which is generally slower than Dijkstra\'s O((V + E) log V)","Bellman-Ford uses a min-heap priority queue to select the lowest-cost unvisited node at each step"], why: [
      '✔ The no-reachable-negative-cycle caveat is the precise guarantee.',
      '✔ V−1 passes — longest simple path bound.',
      '✔ The V-th pass = the detector.',
      '✔ O(V·E) vs O((V+E) log V) — BF trades speed for correctness.',
      '❌ No PQ in BF — that\'s Dijkstra\'s mechanism.'] },
    { id: 'z14', title: 'Q14. Header Changes Across Router Hops (A → R1 → R2 → B)', correct: [0, 1, 2, 4], stmts: ["The source and destination IP addresses remain unchanged end-to-end — every router forwards the same IP header from A to B","At each hop, the source MAC address in the outgoing frame is set to the forwarding router\'s outgoing interface MAC, not Host A\'s MAC","At each hop, the destination MAC address in the outgoing frame is the next-hop device\'s MAC (e.g. R1's MAC, then R2's MAC, then Host B\'s MAC) — never the final destination\'s MAC until the last link","Each router replaces the source IP address with its own IP so that reply packets return to the router rather than directly to Host A","At each router, the incoming frame header is stripped (L2 decapsulation), the IP packet is inspected and forwarded (L3), then a brand-new frame header is constructed for the outgoing link"], why: [
      '✔ IPs are end-to-end (absent NAT).',
      '✔ Fresh frame, fresh source MAC per link.',
      '✔ MAC = next hop only — the final IP is never the frame destination until the last wire.',
      "❌ Routers don\'t rewrite source IPs (that\'s NAT).",
      '✔ Decapsulate → route → re-encapsulate: the router\'s heartbeat.'] },
    { id: 'z15', title: 'Q15. /12 Block: Range and Broadcast (172.16.0.0/12)', correct: [0, 1, 3, 4], stmts: ["The subnet mask is 255.240.0.0","The valid host range is 172.16.0.1 to 172.31.255.254","172.32.0.1 is a valid host address within this subnet","The broadcast address is 172.31.255.255","This block contains exactly 2^20 = 1,048,576 total addresses (1,048,574 usable)"], why: [
      '✔ 12 ones = 11111111.11110000.0.0 = 255.240.0.0.',
      '✔ First usable after network .0.0, last before broadcast .255.255.',
      '❌ 172.32 is outside 172.16–31 — not in this block.',
      '✔ All host bits 1 = 172.31.255.255.',
      '✔ 32−12 = 20 host bits → 2²⁰ total, −2 usable.'] },
    { id: 'z16', title: 'Q16. Splitting /24 into Eight /27 Subnets (10.0.0.0/24)', correct: [0, 1, 2, 4], stmts: ["The /24 can be divided into exactly 8 /27 subnets","Each /27 subnet provides 30 usable host addresses","The broadcast address of the subnet 10.0.0.64/27 is 10.0.0.95","A host at 10.0.0.95 is a valid usable host in the 10.0.0.64/27 subnet","A host at 10.0.0.200 and a host at 10.0.0.220 are in the same /27 subnet"], why: [
      '✔ 3 borrowed bits → 2³ = 8 subnets.',
      '✔ 2⁵ − 2 = 30.',
      '✔ Block .64–.95 → broadcast .95.',
      '❌ .95 IS the broadcast — never a host.',
      '✔ Both fall in .192–.223 → same /27 block.'] },
    { id: 'z17', title: 'Q17. Cross-Subnet Communication via Gateway (.200/26 ↔ .140/26)', correct: [0, 1, 3, 4], stmts: ["192.168.100.200 belongs to the subnet 192.168.100.192/26","192.168.100.140 belongs to the subnet 192.168.100.128/26","The two hosts are in the same /26 subnet and can communicate directly","The host at .200 must send the packet to its default gateway, which will route it to the other subnet","Each /26 subnet provides 62 usable host addresses"], why: [
      '✔ /26 blocks: 0, 64, 128, 192 → .200 ∈ .192–.255.',
      '✔ .140 ∈ .128–.191.',
      "❌ Different subnets — L2 alone can\'t bridge them.",
      '✔ Cross-subnet = via the gateway, always.',
      '✔ 2⁶ − 2 = 62.'] },
    { id: 'z18', title: 'Q18. Dijkstra Silently Wrong on Negative Edge (A→B(2), A→C(4), C→B(−3))', correct: [0, 1, 2, 3], stmts: ["Dijkstra finalizes B first at distance 2, since 2 < 4","After finalizing B, Dijkstra cannot revise B\'s distance even if a cheaper path is later discovered","The true shortest path A->B is via C (cost 4 + (-3) = 1), but Dijkstra reports A->B = 2","Dijkstra\'s greedy assumption breaks: a finalized node CAN have its distance improved via an unvisited node with a negative outgoing edge","Dijkstra raises a runtime exception when it encounters the negative edge weight -3"], why: [
      '✔ Frontier after A: B=2 < C=4 → B finalized first.',
      '✔ The greedy freeze — the fatal step.',
      '✔ True answer 1, reported 2 — silently wrong.',
      '✔ Precisely why negatives are forbidden.',
      '❌ No exception — the danger is that it FAILS QUIETLY.'] },
    { id: 'z19', title: 'Q19. Bellman-Ford Iteration Trace: A-B-C-D Graph (A→B(5), A→C(2), C→D(3), D→B(−4))', correct: [0, 1, 2, 3, 4], stmts: ["After Iteration 1: dist[B]=1, dist[C]=2, dist[D]=5","The shortest path from A to B is A->C->D->B with cost 2+3+(-4) = 1","Iteration 2 produces no changes -- the algorithm has converged after Iteration 1","The order in which edges are processed within a single iteration can affect intermediate values seen within that iteration (but not the final converged result)","For a graph with V=4 nodes, Bellman-Ford requires at most 3 iterations (V-1) to guarantee convergence"], why: [
      '✔ Pass 1 in the given order: B=5→1 (D→B), C=2, D=5.',
      '✔ The negative edge makes the 3-hop path cheapest.',
      '✔ Pass 2 relaxes nothing — converged early.',
      '✔ Order affects intermediate snapshots, never the final answer.',
      '✔ V−1 = 3 passes suffice for V=4.'] },
    { id: 'z20', title: 'Q20. Prim\'s MST: Five-Vertex Graph Dry Run', correct: [0, 1, 2, 3], stmts: ["The first edge added to the MST is A–B with weight 3, since it is the minimum-weight edge adjacent to A","After B joins the MST, vertex C\'s tentative distance decreases from 6 to 2 via edge B–C","The edge C–D (weight 4) is included in the final MST","The total weight of the final MST is 14","Vertex E is added to the MST via edge D–E (weight 7) rather than C–E (weight 5), since D was finalized before E"], why: [
      '✔ Cheapest edge from {A}: A–B=3 beats A–C=6, A–D=9.',
      '✔ Growing tree updates C: 6 → 2 through B.',
      '✔ After B–C(2), C offers D at 4 — cheaper than B–D=8.',
      '✔ 3 + 2 + 4 + 5 = 14 (edges A–B, B–C, C–D, C–E).',
      '❌ E joins via C–E=5 — Prim picks the cheapest frontier edge, and 5 < 7.'] },
    ],
  },

  ];

  /* ================= PRACTICE LOGIC ================= */
  const game = () => window.CN_GAME;
  const prog = () => { try { return JSON.parse(localStorage.getItem('cn_assign') || '{}'); } catch (e) { return {}; } };
  const saveP = d => localStorage.setItem('cn_assign', JSON.stringify(d));
  function isSolved(id) { return !!prog()[id]; }
  function markSolved(id) { const d = prog(); if (!d[id]) { d[id] = 1; saveP(d); const g = game(); if (g) { g.addXP(6, 'Assignment MCQ cracked'); g.bumpDaily('correct'); } } }

  function renderMCQ(container, sec, q) {
    const solved = isSolved(q.id);
    const card = document.createElement('div');
    card.className = 'qq as-q';
    card.innerHTML = `
      <div class="qq-meta"><span class="qq-no">${esc(q.title)}</span>
        <span class="qq-tag">🔥 exam · ${q.correct.length} correct</span>
        ${solved ? '<span class="badge read">solved ✓</span>' : ''}</div>
      <div class="as-note small" style="color:var(--ink-3)">Select ALL that apply, then check.</div>
      <div class="as-opts">${q.stmts.map((s, i) => `
        <label class="as-opt" data-i="${i}"><input type="checkbox"><span class="as-box"></span><span class="as-txt">${esc(s)}</span><span class="as-why" style="display:none"></span></label>`).join('')}</div>
      <div class="as-actions">
        <button class="btn primary small as-check">Check my answer</button>
        <button class="btn ghost small as-reveal">Show answers</button>
        <span class="as-result" style="font-weight:800"></span>
      </div>`;
    container.appendChild(card);
    const opts = $$('.as-opt', card);
    const checkBtn = $('.as-check', card), revealBtn = $('.as-reveal', card);
    const reveal = () => {
      card._revealed = true;
      opts.forEach((o, i) => {
        o.classList.remove('ok', 'bad');
        o.classList.add(q.correct.includes(i) ? 'ok' : 'neutral');
        o.querySelector('input').disabled = true;
        const w = o.querySelector('.as-why');
        w.style.display = 'block';
        w.innerHTML = esc(q.why[i]);
      });
      revealBtn.disabled = true; checkBtn.disabled = true;
      $('.as-result', card).textContent = '';
    };
    checkBtn.onclick = (ev) => {
      const picked = opts.map((o, i) => o.querySelector('input').checked ? i : -1).filter(i => i >= 0);
      if (!picked.length && !card._revealed) return;
      let allRight = true;
      opts.forEach((o, i) => {
        const should = q.correct.includes(i);
        const did = o.querySelector('input').checked;
        o.classList.remove('ok', 'bad', 'neutral');
        o.classList.add(did === should ? 'ok' : 'bad');
        if (did !== should) allRight = false;
        o.querySelector('input').disabled = true;
        const w = o.querySelector('.as-why');
        w.style.display = 'block';
        w.innerHTML = esc(q.why[i]);
      });
      const g = game();
      const res = $('.as-result', card);
      const cx = ev && ev.clientX ? ev.clientX : innerWidth / 2, cy = ev && ev.clientY ? ev.clientY : innerHeight / 2;
      if (allRight) {
        res.textContent = '✅ Perfect — exactly right!';
        res.style.color = 'var(--ok-tx)';
        if (g) {
          g.SFX.correct(); g.confetti(cx, cy, 36, ['✅', '⭐', '🎯']);
          g.floatXP(cx, cy - 40, '+6 XP');
          markSolved(q.id);
          const meta = card.querySelector('.qq-meta');
          if (meta && !meta.querySelector('.badge.read')) meta.insertAdjacentHTML('beforeend', '<span class="badge read">solved ✓</span>');
        }
      } else {
        res.textContent = '❌ Not quite — green = should be selected, red = shouldn\'t. Read the notes and retry mentally.';
        res.style.color = 'var(--warn-tx)';
        if (g) { g.SFX.wrong(); g.comboReset(); }
      }
      checkBtn.disabled = true;
    };
    revealBtn.onclick = reveal;
    if (solved) reveal();
  }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  window.CN_ASSIGN = {
    data: window.CN_ASSIGNMENTS,
    renderMCQ, isSolved, markSolved, esc,
  };
})();
