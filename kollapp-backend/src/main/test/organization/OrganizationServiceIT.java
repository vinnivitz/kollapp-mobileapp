package organization;

import com.none.kollappbackend.organization.adapters.secondary.db.jpa.OrganizationJpaRepository;
import com.none.kollappbackend.organization.adapters.secondary.db.jpa.PersonOfOrganizationJpaRepository;
import com.none.kollappbackend.organization.application.model.Organization;
import com.none.kollappbackend.organization.application.model.OrganizationManager;
import com.none.kollappbackend.organization.application.model.PersonOfOrganization;
import com.none.kollappbackend.organization.application.service.OrganizationService;
import com.none.kollappbackend.user.application.model.KollappUser;
import com.none.kollappbackend.user.application.service.KollappUserService;
import core.BaseIT;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

public class OrganizationServiceIT extends BaseIT {

    @Autowired
    private OrganizationService organizationService;

    @Autowired
    private OrganizationJpaRepository organizationRepository;

    @Autowired
    private PersonOfOrganizationJpaRepository personOfOrganizationRepository;

    @Autowired
    private EntityManager entityManager;

    @MockBean
    private KollappUserService kollappUserService;

    @BeforeEach
    public void beforeEach(){
        KollappUser mockUser = KollappUser.builder().id(1L).name("Erika").surname("Musterfrau").build();
        when(kollappUserService.getLoggedInKollappUser()).thenReturn(mockUser);
    }

    private Organization setupOrganization(){
        Organization organizationInDb = organizationRepository.save(Organization.builder().id(1).name("NMS").build());
        PersonOfOrganization personOfOrga = new OrganizationManager("Erika", "Musterfrau", 1L);
        personOfOrga.setOrganization(organizationInDb);
        personOfOrganizationRepository.save(personOfOrga);
        organizationInDb.addPersonOfOrganization(personOfOrga);
        return organizationInDb;
    }

    @Test
    public void getOrganizationByLoggedInUser(){
        setupOrganization();
        Organization organization = organizationService.getOrganizationByLoggedInUser();
        assertThat(organization.getId()).isEqualTo(1L);
        assertThat(organization.getName()).isEqualTo("NMS");
    }

    @Test
    public void createOrganizationOfLoggedInUser() {
        Organization organizationToPersist = Organization.builder().name("NMS").build();
        Organization persistedOrganization = organizationService.createOrganization(organizationToPersist);
        assertThat(persistedOrganization.getId()).isNotZero();
        assertThat(persistedOrganization.getPersonsOfOrganization().size()).isEqualTo(1);
        assertThat(persistedOrganization.getPersonsOfOrganization().getFirst().getName()).isEqualTo("Erika");
    }

    @Test
    public void editOrganizationOfLoggedInUser() {
        setupOrganization();
        Organization organization = Organization.builder().name("Frequenzfamilie").build();
        Organization updatedOrganization = organizationService.updateOrganization(organization);
        assertThat(updatedOrganization.getName()).isEqualTo("Frequenzfamilie");
    }
}