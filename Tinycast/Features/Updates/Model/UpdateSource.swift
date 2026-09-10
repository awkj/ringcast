import Foundation

struct UpdateSource: Sendable {
    let enabled: Bool
    let repository: String?

    static let current = UpdateSource(
        enabled: AppIdentity.updatesEnabled, repository: AppIdentity.updateRepository)

    var endpoint: URL? {
        guard enabled, let repository else { return nil }
        let parts = repository.split(separator: "/", omittingEmptySubsequences: false)
        let allowed = CharacterSet(charactersIn: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_.-")
        guard parts.count == 2,
            parts.allSatisfy({ !$0.isEmpty && $0.unicodeScalars.allSatisfy(allowed.contains) })
        else { return nil }
        return URL(string: "https://api.github.com/repos/\(repository)/releases?per_page=20")
    }

    func allowsUpdates(on channel: ReleaseChannel) -> Bool {
        endpoint != nil && channel.updatesItself
    }
}
